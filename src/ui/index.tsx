import React           from 'react'
// import ReactDOM from "react-dom/client"
import ReactDOM        from 'react-dom'
import {BrowserRouter} from 'react-router-dom'
import App             from './components/App'


ReactDOM.render(<BrowserRouter><App/></BrowserRouter>, document.getElementById('app'));


// const root = ReactDOM.createRoot(document.getElementById('app'))
// root.render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>
// )
