import { createBrowserRouter } from "react-router-dom";
import Root from "../layout/Root/Root";
import Home from "../pages/Home/Home";
import axios from "axios";

axios.defaults.baseURL = 'http://localhost:5000';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root></Root>,
        children: [
            {
                path: '/',
                element: <Home></Home>,
                loader: async ({request}) => {
                    // console.log(request);
                    const res = await axios.get(`/users?${request.url.split('?')[1] ?? ''}`);
                    return res.data;
                }
            }
        ]
    }
])

export default router;