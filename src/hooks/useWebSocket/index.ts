import useLatest from "@/hooks/useLatest";
import {useEffect, useRef, useState} from "react";
import useUnmount from "@/hooks/useUnmount";
import useMemoizedFn from "@/hooks/useMemoizedFn";

/**
 * ReadyState.Connecting: 正在连接中
 * ReadyState.Open: 已经连接并可以通讯
 * ReadyState.Closing: 连接正在关闭
 * ReadyState.Closed: 连接已关闭或没有连接成功
 * */
export enum ReadyState {
  Connecting = 0,
  Open = 1,
  Closing = 2,
  Closed = 3,
}

/**
 * reconnectLimit: 重试次数
 * reconnectInterval: 重试时间间隔（ms）
 * manual: 手动启动连接
 * onOpen: 连接成功回调
 * onClose: 关闭回调
 * onMessage: 收到消息回调
 * onError: 错误回调
 * protocols: 子协议
 * */
export interface Options {
  reconnectLimit?: number;
  reconnectInterval?: number;
  manual?: boolean;
  onOpen?: (event: WebSocketEventMap['open'], instance: WebSocket) => void;
  onClose?: (event: WebSocketEventMap['close'], instance: WebSocket) => void;
  onMessage?: (message: WebSocketEventMap['message'], instance: WebSocket) => void;
  onError?: (event: WebSocketEventMap['error'], instance: WebSocket) => void;
  protocols?: string | string[];
}

/**
 * latestMessage: 最新消息
 * sendMessage: 发送消息函数
 * disconnect: 手动断开 webSocket 连接
 * connect: 手动连接 webSocket，如果当前已有连接，则关闭后重新连接
 * readyState: 当前 webSocket 连接状态
 * webSocketIns: webSocket 实例
 * */
export interface Result {
  latestMessage?: WebSocketEventMap['message'];
  sendMessage: WebSocket['send'];
  disconnect: () => void;
  connect: () => void;
  readyState: ReadyState;
  webSocketIns?: WebSocket;
}

const useWebSocket = (socketUrl: string, options: Options = {}): Result => {
  const {
    reconnectLimit = 3,
    reconnectInterval = 3 * 1000,
    manual = false,
    onOpen,
    onClose,
    onMessage,
    onError,
    protocols,
  } = options;

  const onOpenRef = useLatest(onOpen);
  const onCloseRef = useLatest(onClose);
  const onMessageRef = useLatest(onMessage);
  const onErrorRef = useLatest(onError);

  const reconnectTimesRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const websocketRef = useRef<WebSocket>();

  const [latestMessage, setLatestMessage] = useState<WebSocketEventMap['message']>();
  const [readyState, setReadyState] = useState<ReadyState>(ReadyState.Closed);

  // 重试
  const reconnect = () => {
    // 没有超过重试次数并且当前 webSocket 实例状态不是 ReadyState.Open
    if (reconnectTimesRef.current < reconnectLimit && websocketRef.current?.readyState !== ReadyState.Open) {
      // 如果存在重试逻辑，则清除掉计定时器
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      // 定时重连
      reconnectTimerRef.current = setTimeout(() => {
        connectWs();
        reconnectTimesRef.current++;
      }, reconnectInterval);
    }
  };

  // 创建连接
  const connectWs = () => {
    // 如果存在重试逻辑，则清除掉计定时器
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    // 如果当前已有连接，则关闭掉
    if (websocketRef.current) {
      websocketRef.current?.close();
    }

    // 创建 webSocket
    const ws = new WebSocket(socketUrl, protocols);
    setReadyState(ReadyState.Connecting);

    // webSocket 错误回调
    ws.onerror = (event) => {
      if (websocketRef.current !== ws) {
        return;
      }
      // 重试
      reconnect();
      // 执行错误回调
      onErrorRef.current?.(event, ws);
      // 修改连接状态
      setReadyState(ws.readyState || ReadyState.Closed);
    }

    // webSocket 连接成功回调
    ws.onopen = (event) => {
      if (websocketRef.current !== ws) {
        return;
      }
      // 执行连接成功回调
      onOpenRef.current?.(event, ws);
      // 重置重试次数
      reconnectTimesRef.current = 0;
      // 修改连接状态
      setReadyState(ws.readyState || ReadyState.Open);
    };

    // webSocket 收到消息回调
    ws.onmessage = (message: WebSocketEventMap['message']) => {
      if (websocketRef.current !== ws) {
        return;
      }
      // 执行收到消息回调
      onMessageRef.current?.(message, ws);
      // 更新最新消息状态
      setLatestMessage(message);
    }

    // webSocket 连接关闭回调
    ws.onclose = (event) => {
      onCloseRef.current?.(event, ws);
      // closed by server
      if (websocketRef.current === ws) {
        reconnect();
      }
      // closed by disconnect or closed by server
      if (!websocketRef.current || websocketRef.current === ws) {
        setReadyState(ws.readyState || ReadyState.Closed);
      }
    }

    // 保存 webSocket 实例
    websocketRef.current = ws;
  };

  // 发送消息函数
  const sendMessage: WebSocket['send'] = (message) => {
    if (readyState === ReadyState.Open) {
      websocketRef.current?.send(message);
    } else {
      throw new Error('Websocket disconnected');
    }
  };

  // 手动连接 webSocket，如果当前已有连接，则关闭后重新连接
  const connect = () => {
    reconnectTimesRef.current = 0;
    connectWs();
  };

  // 手动断开 webSocket 连接
  const disconnect = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    reconnectTimesRef.current = reconnectLimit;
    websocketRef.current?.close();
    websocketRef.current = undefined;
  };

  useEffect(() => {
    // 是否手动启动连接
    if (!manual && socketUrl) {
      connect();
    }
  }, [socketUrl, manual]);

  // 组件销毁
  useUnmount(() => {
    disconnect();
  });

  return {
    latestMessage,
    sendMessage: useMemoizedFn(sendMessage),
    connect: useMemoizedFn(connect),
    disconnect: useMemoizedFn(disconnect),
    readyState,
    webSocketIns: websocketRef.current,
  };
}

export default useWebSocket;
