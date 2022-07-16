import { useState } from 'react'
import axios from 'axios'

function App() {
  const [linkDownload, setLinkDownload] = useState()
  const [loading, setLoading] = useState(false)
  const TYPE_PNG = 0;
  const TYPE_PSD = 2;
  const DOMAIN_NAME = "http://127.0.0.1"
  const PORT = 8686;
  const onSubmit = () => {
    setLoading(true)
    const linkVal = document.getElementById("linkVal").value
    const reqUrl = `${DOMAIN_NAME}:${PORT}/getFile?linkImage=${linkVal}&pageDownload=${TYPE_PNG}`
    axios.get(reqUrl).then((res) => {
      if (res.status === 200) {
        console.log(res);
        setLinkDownload(res.data);
        setLoading(false);
      }
      else {
        alert("File hiện đang bị lỗi! Vui lòng thử lại!");
        console.log(res);
      }
    }).catch((error) => {
      console.error(error)
    })
  }
  return (
    <div className="container">
      <h1>Web get link ảnh Pikbest</h1>
      <input type="text" name="linkVal" id="linkVal" />
      <button onClick={onSubmit}>Tải file</button>
      <br>
      </br>
      {
        loading ? "Đang xử lý" : (linkDownload && <a href={linkDownload}>Link tải ảnh tại đây</a>)
      }
    </div>
  );
}

export default App;
