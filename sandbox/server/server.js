import server from "./src/app.js";
import morgan from "morgan";
server.use(morgan("dev"))
server.listen(3000,()=>{
    console.log('server is running in port 3000');
}) 