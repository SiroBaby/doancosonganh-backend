const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
const path = require('path');


const app = express();
app.use(express.json());
app.use(cors());

//Khai báo thông tin đăng nhập mysql
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pressurestore2',
  port: 3307,
});

//kết nối với mysql
db.connect((err) => {
  if (err) {
    console.error('MySQL connection failed: ' + err.stack);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

//thực hiện upload file ảnh và lưu đường dẫn ảnh vào file image
const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    const imagePath = path.join(__dirname, 'images', req.file.originalname);
    res.json({ message: 'File uploaded successfully', imagePath: imagePath });
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
});

//api thêm sản phẩm
app.post('/adding', (req, res) => {
  const {
    Ma_SP,
    Gia_BD,
    Phan_tram_giam,
    Gia_ban,
    So_luong,
    Trong_luong,
    Kich_thuoc,
    Hinh_dang,
    Mau_sac,
    Do_tinh_khiet,
    Hinh_anh,
    Ma_loai,
  } = req.body;
  
  const sql = "INSERT INTO san_pham (`Ma_SP`, `Gia_BD`, `Phan_tram_giam`, `Gia_ban`, `So_luong`, `Trong_luong`, `Kich_thuoc`, `Hinh_dang`, `Mau_sac`, `Do_tinh_khiet`, `Hinh_anh`, `Ma_loai`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  const values = [
    Ma_SP,
    Gia_BD,
    Phan_tram_giam,
    Gia_ban,
    So_luong,
    Trong_luong,
    Kich_thuoc,
    Hinh_dang,
    Mau_sac,
    Do_tinh_khiet,
    Hinh_anh,
    Ma_loai,
  ];
  console.log('Executing SQL query:', sql);
  console.log('Query values:', values);

  db.query(sql, values, (err, data) => {
    if (err) {
      console.error('Error executing query: ' + err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.status(200).json({ message: 'Product added successfully' });
  });
})

//api login
app.post('/login', (req, res) => {
  const sql = "SELECT * FROM user WHERE Phone = ? AND Password = ?";

  db.query(sql, [req.body.phone, req.body.password], (err, result) => {
     
    if (result.length > 0) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Login failed' });
    }
    
    if (err) {
      console.error('Error executing query: ' + err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

  });
});

// app.post('/checkout', (req, res) => {
//   const { ten_sanpham, gia_ban, soluong, thanhtien } = req.body;
//   const sql = 'INSERT INTO sanpham (ten_sanpham, gia_ban, soluong, thanhtien) VALUES (?, ?, ?, ?)';
//   db.query(sql, [ten_sanpham, gia_ban, soluong, thanhtien], (err, result) => {
//     if (err) {
//       console.error('Error executing query: ' + err.stack);
//       res.status(500).send('Internal Server Error');
//       return;
//     }
//     res.status(200).send('Payment successful');
//   });
// });

//<--------------------------------------Test đổ dữ liệu từ dtb vào----------------------->

// app.get('/getUsername', (req, res) => {
//     const sql = 'SELECT * FROM User;';
//     db.query(sql, (err, result) => {
//       if (err) return res.json(err);
//       return res.json(data);
//     });
//   });

//<--------------------------------------Test đổ dữ liệu từ dtb vào----------------------->
  
//Kiểm tra kết nối với mysql
const PORT = process.env.PORT || 3308;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});