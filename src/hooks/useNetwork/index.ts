import {useEffect, useState} from "react";
import {isObject} from "../../../utils";

/**
 * since: online 最后改变时间
 * online: 网络是否为在线
 * rtt: 当前连接下评估的往返时延
 * type: 设备使用与所述网络进行通信的连接的类型 bluetooth | cellular | ethernet | none | wifi | wimax | other | unknown
 * downlink: 有效带宽估算（单位：兆比特/秒）
 * downlinkMax: 最大下行速度（单位：兆比特/秒）
 * saveData: 用户代理是否设置了减少数据使用的选项
 * effectiveType: 网络连接的类型 slow-2g | 2g | 3g | 4g
 * */
export interface NetworkState {
  since?: Date;
  online?: boolean;
  rtt?: number;
  type?: string;
  downlink?: number;
  saveData?: boolean;
  downlinkMax?: number;
  effectiveType?: string;
}

enum NetworkEventType {
  ONLINE = 'online',
  OFFLINE = 'offline',
  CHANGE = 'change',
}

function getConnection() {
  const nav = navigator as any;
  if (!isObject(nav)) return null;
  return nav.connection || nav.mozConnection || nav.webkitConnection;
}

function getConnectionProperty(): NetworkState {
  const c = getConnection();
  if (!c) return {};
  return {
    rtt: c.rtt,
    type: c.type,
    saveData: c.saveData,
    downlink: c.downlink,
    downlinkMax: c.downlinkMax,
    effectiveType: c.effectiveType,
  }
}

const useNetwork = (): NetworkState => {
  const [state, setState] = useState(() => {
    return {
      since: undefined,
      online: navigator?.onLine,
      ...getConnectionProperty(),
    }
  });

  useEffect(() => {
    const onOnline = () => {
      setState((prevState) => ({
        ...prevState,
        online: true,
        since: new Date(),
      }));
    };

    const onOffline = () => {
      setState((prevState) => ({
        ...prevState,
        online: false,
        since: new Date(),
      }));
    };

    const onConnectionChange = () => {
      setState((prevState) => ({
        ...prevState,
        ...getConnectionProperty(),
      }));
    };

    // 监听网络 online 事件
    window.addEventListener(NetworkEventType.ONLINE, onOnline);
    // 监听网络 offline 事件
    window.addEventListener(NetworkEventType.OFFLINE, onOffline);

    // 监听 navigator 的 connection 的 change 事件
    const connection = getConnection();
    connection?.addEventListener(NetworkEventType.CHANGE, onConnectionChange);

    return () => {
      window.removeEventListener(NetworkEventType.ONLINE, onOnline);
      window.removeEventListener(NetworkEventType.OFFLINE, onOffline);
      connection?.removeEventListener(NetworkEventType.CHANGE, onConnectionChange);
    };
  }, []);

  return state;
}

export default useNetwork;
