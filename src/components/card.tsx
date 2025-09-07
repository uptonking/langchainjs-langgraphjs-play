import * as React from 'react';

import { CardContent } from './card-content';

export const Card = ({ size } = { size: 12 }) => {
  return (
    <div style={{ padding: size ? size : 12, backgroundColor: 'beige' }}>
      <h3>Card标题</h3>
      <CardContent>content 内容部分11</CardContent>
    </div>
  );
};
