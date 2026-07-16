import dynamic from 'next/dynamic';

const ToolHome = dynamic(() => import('./pages'), { ssr: false });

export default ToolHome;
