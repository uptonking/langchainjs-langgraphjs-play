// declare module '*.css';
// declare module '*.scss';
// declare module '*.less';

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png';
declare module '*.jpeg';
declare module '*.jpg';
