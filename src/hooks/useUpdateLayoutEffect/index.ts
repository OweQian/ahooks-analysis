import {useLayoutEffect} from 'react';
import {createUpdateEffect} from '@/hooks/createUpdateEffect';

export default createUpdateEffect(useLayoutEffect);
