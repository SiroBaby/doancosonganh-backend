const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
const path = require('path');


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'))

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

app.use("/public", express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  },
});

//thực hiện upload file ảnh và lưu đường dẫn ảnh vào file image
const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
  console.log(req.file);
  if (req.file) {
    const imagePath = req.file.filename;
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

app.get("/product/:id", (req, res) => {
  const maSP = req.params.id;
  console.log(maSP);
  // Thực hiện truy vấn để lấy thông tin chi tiết sản phẩm từ cơ sở dữ liệu
  // const sql = "SELECT * FROM san_pham WHERE Ma_SP = ?";
  const sql = `
  SELECT san_pham.*, danh_muc_san_pham.Ten_Loai
  FROM san_pham
  JOIN danh_muc_san_pham ON san_pham.Ma_Loai = danh_muc_san_pham.Ma_Loai
  WHERE san_pham.Ma_SP = ?;
`;

  db.query(sql, [maSP], (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.stack);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    // Kiểm tra nếu sản phẩm không tồn tại
    if (results.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Trả về thông tin chi tiết sản phẩm
    const productDetail = results[0];

    const imagePath = `http://localhost:3308/public/images/${productDetail.Hinh_Anh}`;
    productDetail.ImagePath = imagePath;
    res.status(200).json(productDetail);
  });
});

//api lấy dữ liệu sản phẩm đang được sửa
app.get('/editproducts/:id', (req, res) => {
  const productId = req.params.id;
  console.log('Handling request for product with ID:', productId);
  const sql = 'SELECT * FROM san_pham WHERE Ma_SP = ?';

  db.query(sql, [productId], (err, result) => {
    if (err) {
      console.error('Error executing query: ' + err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json(result[0]); // Trả về thông tin sản phẩm cụ thể
  });
});


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

//api lấy danh sách toàn bộ sản phẩm
app.get('/getproducts', (req, res) => {
  const sql = 'SELECT * FROM san_pham;';
  db.query(sql, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

//api lấy danh sách toàn bộ người dùng
app.get('/getuser', (req, res) => {
  const sql = 'SELECT * FROM User';
  db.query(sql, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  })
})

//api lấy thông tin người dùng nhất định
app.get('/getuser/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM User WHERE Phone = ?';
  console.log('Excuting SQL query: ', sql);
  console.log('Value: ', id);
  db.query(sql, id, (err, result) => {
    if (err) {
      console.error('Error executing query: ' + err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json(result[0]); // Trả về thông tin sản phẩm cụ thể
  });
})

//api sửa thông tin người dùng
app.put('/edituser/:id', async (req, res) => {
  const userId = req.params.id;
  const {
    Phone,
    Username,
    Password,
    Email
  } = req.body;
  const sql = `UPDATE User SET Phone = ?, Username = ?, Password = ?, Email = ? WHERE Phone = ? `;
  const value = [Phone, Username, Password, Email, userId];
  console.log('Executing SQL query: ', sql);
  console.log('Values: ', value);
  db.query(sql, value, (err, data) => {
    if (err) {
      console.error('Error executing query: ' + err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.status(200).json({ message: 'Edit user successfully' });
  })
})

// Api xóa người dùng
app.delete('/deleteuser/:id', async (req, res) => {
  const userId = req.params.id; // Sửa thành req.params.id
  const sql = `DELETE FROM User WHERE Phone = ?`
  console.log('Executing SQL query:', sql);
  db.query(sql, userId, (err, data) => {
    if (err) {
      console.error('Error executing query: ' + err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.status(200).json({ message: 'Delete user successfully' }); // Sửa thành 'Delete product successfully'
  });
})

//api update sản phẩm
app.post('/updateproduct/:id', async (req, res) => {
  const productId = req.params.id;
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
    Ma_loai,
  } = req.body;

  // Xử lý cập nhật sản phẩm
  try {
    const sql = `
      UPDATE san_pham 
      SET 
        Ma_SP = ?, 
        Gia_BD = ?, 
        Phan_tram_giam = ?, 
        Gia_ban = ?, 
        So_luong = ?, 
        Trong_luong = ?, 
        Kich_thuoc = ?, 
        Hinh_dang = ?, 
        Mau_sac = ?, 
        Do_tinh_khiet = ?, 
        Ma_loai = ? 
      WHERE 
        Ma_SP = ?;
    `;

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
      Ma_loai,
      productId,
    ];

    await db.query(sql, values);
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// api sửa hình ảnh sản phẩm
app.post('/updatepicture/:id', async (req, res) => {
  const productId = req.params.id;
  const {
    Hinh_anh
  } = req.body;
  const sql = `
  UPDATE san_pham 
  SET Hinh_anh = ? 
  WHERE Ma_SP = ?;
`;
  const value = [Hinh_anh, productId];
  console.log('Executing SQL query:', sql);
  console.log('Query values:', value);
  db.query(sql, value, (err, data) => {
    if (err) {
      console.error('Error executing query: ' + err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.status(200).json({ message: 'Picture edit successfully' });
  });
})

// Api xóa sản phẩm
app.delete('/deleteproducts/:id', async (req, res) => {
  const productId = req.params.id;

  // Kiểm tra xem có dữ liệu trong bảng gio_hang tham chiếu đến sản phẩm không
  const checkQuery = 'SELECT COUNT(*) AS count FROM gio_hang WHERE Ma_SP = ?';
  db.query(checkQuery, productId, (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking related data: ' + checkErr.stack);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    const rowCount = checkResult[0].count;

    // Nếu có dữ liệu liên quan trong bảng gio_hang, thực hiện xóa trước
    if (rowCount > 0) {
      const deleteQuery = 'DELETE FROM gio_hang WHERE Ma_SP = ?';
      db.query(deleteQuery, productId, (deleteErr, deleteResult) => {
        if (deleteErr) {
          console.error('Error deleting related data: ' + deleteErr.stack);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }

        // Sau khi xóa dữ liệu trong gio_hang, thực hiện xóa sản phẩm
        executeDeleteProductQuery();
      });
    } else {
      // Nếu không có dữ liệu liên quan trong gio_hang, thực hiện xóa sản phẩm trực tiếp
      executeDeleteProductQuery();
    }
  });

  function executeDeleteProductQuery() {
    const deleteProductQuery = 'DELETE FROM san_pham WHERE Ma_SP = ?';
    db.query(deleteProductQuery, productId, (err, data) => {
      if (err) {
        console.error('Error executing query: ' + err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.status(200).json({ message: 'Delete product successfully' });
    });
  }
});


// Lấy toàn bộ danh sách trong bảng gio_hang dựa vào sđt user
app.get('/getcart/:phone', async (req, res) => {
  const Phone = req.params.phone;
  const sql = 'SELECT san_pham.Hinh_anh, gio_hang.Ma_GH , san_pham.Ma_SP, san_pham.Gia_ban, gio_hang.So_luong, gio_hang.Tong_tien, User.Phone FROM user JOIN gio_hang ON user.Phone = gio_hang.Phone JOIN san_pham ON gio_hang.Ma_SP = san_pham.Ma_SP WHERE User.Phone = ?'
  console.log('Executing SQL query:', sql);
  console.log('Executing Phone:', Phone);
  db.query(sql, Phone, (err, data) => {
    if (err) {
      console.error('Error excuting query:' + err.stack);
      res.status(500).json({error: 'Internal Server Error'});
      return;
    }
    if (data.length === 0) {
      res.status(404).json({error: 'Product not found'});
      return;
    }
    res.status(200).json(data);
  })
})

//api thêm sản phẩm vào giỏ hàng
app.post('/addtocart/:id', async (req, res) => {
  const ID = req.params.id;
  const {
    Phone,
    Ma_SP,
    So_luong,
    Gia_SP,
  } = req.body;
  const checkQuery = 'SELECT * FROM gio_hang WHERE Phone = ? AND Ma_SP = ?';
  db.query(checkQuery, [Phone, Ma_SP], async (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking existing product in cart:', checkErr);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (checkResult.length > 0) {
      // Tăng số lượng sản phẩm lên 1
      const updateQuery = 'UPDATE gio_hang SET So_luong = So_luong + 1, Tong_tien = So_luong * Gia_SP WHERE Phone = ? AND Ma_SP = ?';
      db.query(updateQuery, [Phone, Ma_SP], async (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating quantity of existing product in cart:', updateErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        return res.status(200).json({ message: 'Product quantity updated successfully in cart' });
      });
    } else {
      // Nếu sản phẩm chưa tồn tại trong giỏ hàng, thực hiện thêm sản phẩm vào giỏ hàng
      const insertQuery = 'INSERT INTO gio_hang (Phone, Ma_SP, So_luong, Gia_SP, Tong_tien) VALUES (?, ?, ?, ?, ?)';
      const tongTien = So_luong * Gia_SP;
      db.query(insertQuery, [Phone, Ma_SP, So_luong, Gia_SP, tongTien], async (insertErr, insertResult) => {
        if (insertErr) {
          console.error('Error adding product to cart:', insertErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        return res.status(200).json({ message: 'Product added successfully to cart' });
      });
    }
  });
})

//api cập nhật số lượng và giá sản phẩm
app.post('/updatecart/:phone', async (req, res) => {
  const phone = req.params.phone;
  const updatedProducts = req.body.products;

  // Tạo mảng chứa các truy vấn cập nhật sản phẩm
  const updatePromises = updatedProducts.map(product => {
    const { Ma_SP, So_luong, Gia_ban } = product;
    const tongTien = So_luong * Gia_ban;

    // Tạo truy vấn cập nhật sản phẩm có số lượng thay đổi
    const sql = `
      UPDATE gio_hang 
      SET So_luong = ?, 
          Tong_tien = ? 
      WHERE Phone = ? AND Ma_SP = ?;
    `;
    const values = [So_luong, tongTien, phone, Ma_SP];

    return db.query(sql, values);
  });

  try {
    // Chờ tất cả các truy vấn cập nhật hoàn thành
    await Promise.all(updatePromises);

    // Gửi phản hồi thành công về client
    res.status(200).json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Api xóa sản phẩm từ giỏ hàng dựa vào Phone và Ma_SP
app.delete('/deleteproduct/:phone/:maSP', async (req, res) => {
  const phone = req.params.phone;
  const maSP = req.params.maSP;

  try {
    // Thực hiện truy vấn xóa sản phẩm từ giỏ hàng
    const deleteQuery = 'DELETE FROM gio_hang WHERE Phone = ? AND Ma_SP = ?';
    await db.query(deleteQuery, [phone, maSP]);

    // Gửi phản hồi về client
    res.status(200).json({ message: 'Product deleted successfully from cart' });
  } catch (error) {
    console.error('Error deleting product from cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Thêm giá trị thanh toán vào database thanh_toan
app.post('/addpayment', async (req, res) => {
  const {
    Ma_GH,
    Phone,
    Phuong_thuc_TT,
    Ma_SP,
    Gia_SP,
    So_luong,
    Hinh_anh,
    Email,
  } = req.body;

  try {
    const sql = 'INSERT INTO thanh_toan (Ma_GH, Phone, Phuong_thuc_TT, Ma_SP, Gia_SP, So_luong, Hinh_anh, Email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    
    const values = [
      Ma_GH,
      Phone,
      Phuong_thuc_TT,
      Ma_SP,
      Gia_SP,
      So_luong,
      Hinh_anh,
      Email,
    ];

    await db.query(sql, values);
    res.status(200).json({ message: 'Product add to payment succesful!' });
  } catch (error) {
    console.error('Error add payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// Bổ sung middleware xử lý lỗi không nằm trong route
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

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
