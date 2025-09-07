import './index.scss';
import logo from './assets/images/react-logo.svg';

import * as React from 'react';

import { Card } from './components';

export const App = () => {
  return (
    <div>
      <input type='' />
      <h1>Hello, 世界 20250516-1645 </h1>
      <img src={logo} className='AppLogo' alt='logo' />
      <Card size={16} />
    </div>
  );
};

export default App;
