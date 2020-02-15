import React, { useState } from 'react';

const CheckedContext = React.createContext([{}, () => {}]);

const CheckedProvider = (props) => {
  const [state, setState] = useState({});
  return (
    <CheckedContext.Provider value={[state, setState]}>
      {props.children}
    </CheckedContext.Provider>
  );
}

export { CheckedContext, CheckedProvider };