import {useEffect, useState} from 'react';

function useEffectAllDepsChange(fn, deps) {
  const [changeTarget, setChangeTarget] = useState(deps);

  useEffect(() => {
    setChangeTarget(prev => {
      if (prev.every((dep, i) => dep !== deps[i])) {
        return deps;
      }

      return prev;
    });
  }, [deps]);

  useEffect(fn, changeTarget);
}

export default useEffectAllDepsChange;
