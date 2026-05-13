// // 'use client'

// // import { lazy, Suspense } from 'react'
// // import { Provider } from 'react-redux'
// // import { store } from '../../store/store'

// // // Lazy load the ShellWithRedux component
// // const ShellWithRedux = lazy(() => import('./ShellWithRedux'))

// // export default function ClientLayoutShell({ children }) {
// //   return (
// //     <Provider store={store}>
// //       <Suspense fallback={
// //         <div className="min-h-screen bg-[#faf6f3] flex items-center justify-center">
// //           <div className="animate-pulse w-24 h-24 rounded-full bg-gray-200"></div>
// //         </div>
// //       }>
// //         <ShellWithRedux>{children}</ShellWithRedux>
// //       </Suspense>
// //     </Provider>
// //   )
// // }


// // src/app/partials/ClientLayoutShell/.jsx
// 'use client'

// import { Provider } from 'react-redux'
// import { store } from '../../store/store'
// import ShellWithRedux from './ShellWithRedux'

// import { Suspense } from 'react'

// export default function ClientLayoutShell({ children, initialNavData }) {
//   return (
//     <Provider store={store}>
//       <Suspense fallback={
//         <div className="min-h-screen bg-[#faf6f3] flex items-center justify-center">
//           <div className="animate-pulse w-24 h-24 rounded-full bg-gray-200"></div>
//         </div>
//       }>
//         <ShellWithRedux initialNavData={initialNavData}>{children}</ShellWithRedux>
//       </Suspense>
//     </Provider>
//   )
// }


// client/src/app/partials/ClientLayoutShell.jsx
"use client";

import { Suspense } from "react";
import { Provider } from "react-redux";
import { store } from "../../store/store";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import ShellWithRedux from "./ShellWithRedux";
import "@/lib/i18n";

export default function ClientLayoutShell({ children, initialNavData }) {
  return (
    <Provider store={store}>
      <ReactQueryProvider>
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#faf6f3] flex items-center justify-center">
              <div className="animate-pulse w-24 h-24 rounded-full bg-gray-200"></div>
            </div>
          }
        >
          <ShellWithRedux initialNavData={initialNavData}>
            {children}
          </ShellWithRedux>
        </Suspense>
      </ReactQueryProvider>
    </Provider>
  );
}
