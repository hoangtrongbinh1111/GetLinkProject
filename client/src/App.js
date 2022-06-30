import { useState } from 'react'
import axios from 'axios'

function App() {
  const [linkDownload,setLinkDownload] = useState()
  const [loading,setLoading] = useState(true)
  const TYPE_PNG = 0;
  const TYPE_PSD = 1;
  const onSubmit = () => {
    setLoading(false)
    const linkVal = document.getElementById("linkVal").value
    const reqUrl = `http://127.0.0.1:3001/test?linkImage=${linkVal}&typeDownload=${TYPE_PSD}`
    axios.get(reqUrl).then((res) => {
      console.log(res);
      setLinkDownload(res.data)
      setLoading(true)
    }).catch((error)=>{
      console.error(error)
    })
  }
  return (
    <div className="container">
      <h1>Web get link ảnh PngTree</h1>
      <input type="text" name="linkVal" id="linkVal" />
      <button onClick={onSubmit}>Get Link</button>
      <br>
      </br>
      {loading ? (linkDownload && <a href={linkDownload}>Link tải ảnh tại đây</a>
      ) : "Đang xử lý"}
      
    </div>
  );
}

export default App;
