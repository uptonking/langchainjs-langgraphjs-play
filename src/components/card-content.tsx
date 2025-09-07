import * as React from 'react';

type CardContentProps = {
  text?: string;
  children?: React.ReactNode;
};

export const CardContent = ({ text = '', children }: CardContentProps) => {
  return (
    <div>
      <h4>content title</h4>
      <p>{text}</p>
      {children}
    </div>
  );
};
