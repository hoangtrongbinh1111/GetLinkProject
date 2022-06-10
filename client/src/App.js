import { useState } from 'react'
import axios from 'axios'

function App() {
  const [linkDownload,setLinkDownload] = useState()
  const [loading,setLoading] = useState(true)
  const onSubmit = () => {
    setLoading(false)
    const linkVal = document.getElementById("linkVal").value
    const reqUrl = `http://207.148.71.10:3001/test?linkImage=${linkVal}`
    axios.get(reqUrl).then((res) => {
      setLinkDownload(res)
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
