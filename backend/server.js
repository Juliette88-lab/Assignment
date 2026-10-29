require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from .env");
}

app.use(cors());
app.use(express.json());

// ========================================
// PRODUCTS: 30 PRODUCTS, 6 CATEGORIES
// ========================================

const products = [
  {
    id: 1,
    name: "Classic T-Shirt",
    category: "Clothes",
    price: 5000,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700",
  },
  {
    id: 2,
    name: "Polo Shirt",
    category: "Clothes",
    price: 8000,
    image: "https://images.unsplash.com/photo-1625910513413-5fc45e7d4c2a?w=700",
  },
  {
    id: 3,
    name: "Blue Jeans",
    category: "Clothes",
    price: 15000,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=700",
  },
  {
    id: 4,
    name: "Summer Dress",
    category: "Clothes",
    price: 18000,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700",
  },
  {
    id: 5,
    name: "Men's Shirt",
    category: "Clothes",
    price: 12000,
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=700",
  },

  {
    id: 6,
    name: "Running Sneakers",
    category: "Shoes",
    price: 25000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700",
  },
  {
    id: 7,
    name: "Leather Shoes",
    category: "Shoes",
    price: 30000,
    image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=700",
  },
  {
    id: 8,
    name: "Women's Heels",
    category: "Shoes",
    price: 22000,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700",
  },
  {
    id: 9,
    name: "Casual Sandals",
    category: "Shoes",
    price: 8000,
    image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=700",
  },
  {
    id: 10,
    name: "School Shoes",
    category: "Shoes",
    price: 18000,
    image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=700",
  },

  {
    id: 11,
    name: "Ladies Handbag",
    category: "Bags",
    price: 20000,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700",
  },
  {
    id: 12,
    name: "School Backpack",
    category: "Bags",
    price: 15000,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700",
  },
  {
    id: 13,
    name: "Travel Bag",
    category: "Bags",
    price: 28000,
    image: "https://images.unsplash.com/photo-1553531384-411a247ccd73?w=700",
  },
  {
    id: 14,
    name: "Small Purse",
    category: "Bags",
    price: 7000,
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=700",
  },
  {
    id: 15,
    name: "Laptop Bag",
    category: "Bags",
    price: 25000,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700",
  },

  {
    id: 16,
    name: "Gold Necklace",
    category: "Jewellery",
    price: 35000,
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=700",
  },
  {
    id: 17,
    name: "Gold Earrings",
    category: "Jewellery",
    price: 15000,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700",
  },
  {
    id: 18,
    name: "Gold Ring",
    category: "Jewellery",
    price: 20000,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700",
  },
  {
    id: 19,
    name: "Gold Bracelet",
    category: "Jewellery",
    price: 25000,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=700",
  },
  {
    id: 20,
    name: "Wristwatch",
    category: "Jewellery",
    price: 18000,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=700",
  },

  {
    id: 21,
    name: "Lipstick",
    category: "Cosmetics",
    price: 4000,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=700",
  },
  {
    id: 22,
    name: "Face Cream",
    category: "Cosmetics",
    price: 7000,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=700",
  },
  {
    id: 23,
    name: "Perfume",
    category: "Cosmetics",
    price: 12000,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=700",
  },
  {
    id: 24,
    name: "Makeup Kit",
    category: "Cosmetics",
    price: 15000,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700",
  },
  {
    id: 25,
    name: "Body Lotion",
    category: "Cosmetics",
    price: 6000,
    image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=700",
  },

  {
    id: 26,
    name: "Electric Kettle",
    category: "Home Equipment",
    price: 18000,
    image: "https://images.unsplash.com/photo-1594213114663-d94db9b17125?w=700",
  },
  {
    id: 27,
    name: "Blender",
    category: "Home Equipment",
    price: 30000,
    image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=700",
  },
  {
    id: 28,
    name: "Cooking Pot",
    category: "Home Equipment",
    price: 12000,
    image: "https://images.unsplash.com/photo-1584990347449-a8e4c2e9e4c1?w=700",
  },
  {
    id: 29,
    name: "Dinner Plate Set",
    category: "Home Equipment",
    price: 15000,
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=700",
  },
  {
    id: 30,
    name: "Electric Iron",
    category: "Home Equipment",
    price: 22000,
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=700",
  },
];

// ========================================
// AUTHENTICATION MIDDLEWARE
// ========================================

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Please log in to access this resource.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token. Please log in again.",
    });
  }
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    residence: user.residence || "",
  };
}

function mapOrder(row) {
  let items = row.items;

  if (typeof items === "string") {
    try {
      items = JSON.parse(items);
    } catch {
      items = [];
    }
  }

  return {
    id: row.id,
    orderNumber: `DG${row.id}`,
    userId: row.user_id,
    fullName: row.full_name,
    phone: row.phone,
    address: row.address,
    items,
    total: Number(row.total),
    status: row.status,
    returnReason: row.return_reason || "",
    returnDescription: row.return_description || "",
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  };
}

// ========================================
// API HEALTH CHECK
// ========================================

app.get("/api", (req, res) => {
  res.json({
    message: "D&G E-Commerce API is working successfully!",
    products: products.length,
  });
});

// ========================================
// REGISTER
// POST /api/auth/register
// ========================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), normalizedEmail, hashedPassword],
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: normalizedEmail,
      phone: "",
      residence: "",
    };

    return res.status(201).json({
      message: "Account created successfully.",
      user,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Server error during registration.",
    });
  }
});

// ========================================
// LOGIN
// POST /api/auth/login
// ========================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const [rows] = await db.execute(
      `SELECT id, name, email, password, phone, residence
       FROM users WHERE email = ?`,
      [email.trim().toLowerCase()],
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    return res.json({
      message: "Login successful.",
      accessToken,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error during login.",
    });
  }
});

// ========================================
// GET PROFILE
// ========================================

app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, name, email, phone, residence
       FROM users WHERE id = ?`,
      [req.userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ user: publicUser(rows[0]) });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      message: "Unable to retrieve profile.",
    });
  }
});

// ========================================
// UPDATE PROFILE
// ========================================

app.put("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, residence } = req.body;

    const [found] = await db.execute(
      `SELECT id, name, email, phone, residence
       FROM users WHERE id = ?`,
      [req.userId],
    );

    if (found.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const current = found[0];
    const newName = name === undefined ? current.name : name;
    const newEmail =
      email === undefined
        ? current.email
        : typeof email === "string"
          ? email.trim().toLowerCase()
          : email;
    const newPhone = phone === undefined ? current.phone || "" : phone;
    const newResidence =
      residence === undefined ? current.residence || "" : residence;

    if (typeof newName !== "string" || !newName.trim()) {
      return res.status(400).json({ message: "Name cannot be empty." });
    }

    if (
      typeof newEmail !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)
    ) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (typeof newPhone !== "string") {
      return res.status(400).json({ message: "Phone must be a string." });
    }

    if (typeof newResidence !== "string") {
      return res.status(400).json({
        message: "Residence must be a string.",
      });
    }

    const [duplicate] = await db.execute(
      "SELECT id FROM users WHERE email = ? AND id <> ?",
      [newEmail, req.userId],
    );

    if (duplicate.length > 0) {
      return res.status(409).json({
        message: "This email is already used by another account.",
      });
    }

    await db.execute(
      `UPDATE users
       SET name = ?, email = ?, phone = ?, residence = ?
       WHERE id = ?`,
      [
        newName.trim(),
        newEmail,
        newPhone.trim(),
        newResidence.trim(),
        req.userId,
      ],
    );

    return res.json({
      message: "Profile updated successfully.",
      user: {
        id: req.userId,
        name: newName.trim(),
        email: newEmail,
        phone: newPhone.trim(),
        residence: newResidence.trim(),
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "This email is already used by another account.",
      });
    }

    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Unable to update profile.",
    });
  }
});

/* ========================================
   FORGOT PASSWORD
   POST /api/auth/forgot-password
======================================== */

// DEMO ONLY:
// Creates a short-lived reset token and returns it to the app.
// In production, send the token through a verified email instead.
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Email address is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const [users] = await db.execute(
      "SELECT id, email FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail],
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "No account was found with this email address.",
      });
    }

    const user = users[0];

    // Generate a cryptographically secure, random token.
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the SHA-256 hash of the token.
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Allow only one active reset token per user.
    await db.execute("DELETE FROM password_reset_tokens WHERE user_id = ?", [
      user.id,
    ]);

    // Token expires after 15 minutes.
    await db.execute(
      `INSERT INTO password_reset_tokens
        (user_id, token_hash, expires_at)
       VALUES (
        ?,
        ?,
        DATE_ADD(UTC_TIMESTAMP(), INTERVAL 15 MINUTE)
       )`,
      [user.id, tokenHash],
    );

    // Demo only: the app receives the token directly.
    return res.status(200).json({
      message: "Email verified for demo. You can now reset your password.",
      demoToken: resetToken,
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Unable to start password reset. Please try again.",
    });
  }
});
app.post("/api/auth/reset-password", async (req, res) => {
  let connection;

  try {
    const { email, token, newPassword, confirmPassword } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof token !== "string" ||
      !token.trim() ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return res.status(400).json({
        message: "Email, token, and both password fields are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    connection = await db.getConnection();

    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT prt.id AS reset_id, prt.user_id
       FROM password_reset_tokens AS prt
       INNER JOIN users AS u ON u.id = prt.user_id
       WHERE prt.token_hash = ?
         AND u.email = ?
         AND prt.expires_at > UTC_TIMESTAMP()
       LIMIT 1
       FOR UPDATE`,
      [tokenHash, normalizedEmail],
    );

    if (rows.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        message:
          "The reset link is invalid, expired, or already used. Please request a new one.",
      });
    }

    const resetRecord = rows[0];

    // Hash the new password before saving it.
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await connection.execute("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      resetRecord.user_id,
    ]);

    // Delete this token and any other outstanding tokens for the user.
    await connection.execute(
      "DELETE FROM password_reset_tokens WHERE user_id = ?",
      [resetRecord.user_id],
    );

    await connection.commit();

    return res.status(200).json({
      message: "Password changed successfully. You can now log in.",
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Password reset rollback error:", rollbackError);
      }
    }

    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Unable to reset password. Please try again.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// ========================================
// GET ALL PRODUCTS
// ========================================

app.get("/api/products", (req, res) => {
  const { category, search } = req.query;
  let result = [...products];

  if (category) {
    result = result.filter(
      (product) =>
        product.category.toLowerCase() === String(category).toLowerCase(),
    );
  }

  if (search) {
    const keyword = String(search).trim().toLowerCase();

    result = result.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword),
    );
  }

  return res.json({
    count: result.length,
    products: result,
  });
});

// ========================================
// GET ONE PRODUCT
// ========================================

app.get("/api/products/:id", (req, res) => {
  const product = products.find((item) => item.id === Number(req.params.id));

  if (!product) {
    return res.status(404).json({
      message: "Product not found.",
    });
  }

  return res.json(product);
});

// ========================================
// CREATE ORDER
// ========================================

app.post("/api/orders", async (req, res) => {
  try {
    const { fullName, phone, address, items } = req.body;

    if (
      typeof fullName !== "string" ||
      !fullName.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof address !== "string" ||
      !address.trim()
    ) {
      return res.status(400).json({
        message: "Name, phone and address are required.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const orderItems = [];

    for (const item of items) {
      const product = products.find((p) => p.id === Number(item.id));
      const quantity = Number(item.quantity);

      if (
        !product ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {
        return res.status(400).json({
          message: "Invalid product or quantity.",
        });
      }

      orderItems.push({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
        quantity,
        subtotal: product.price * quantity,
      });
    }

    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    let userId = null;
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch {
        // Guest checkout remains available.
      }
    }

    const [result] = await db.execute(
      `INSERT INTO orders
       (user_id, full_name, phone, address, items, total, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        userId,
        fullName.trim(),
        phone.trim(),
        address.trim(),
        JSON.stringify(orderItems),
        total,
      ],
    );

    const [rows] = await db.execute("SELECT * FROM orders WHERE id = ?", [
      result.insertId,
    ]);

    return res.status(201).json({
      message: "Order created successfully.",
      order: mapOrder(rows[0]),
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      message: "Unable to create order.",
    });
  }
});

// ========================================
// GET ALL ORDERS
// Development/testing endpoint.
// ========================================

app.get("/api/orders", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM orders ORDER BY created_at DESC, id DESC",
    );

    return res.json({
      count: rows.length,
      orders: rows.map(mapOrder),
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      message: "Unable to retrieve orders.",
    });
  }
});

// ========================================
// GET ONE ORDER
// ========================================

app.get("/api/orders/:id", async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    const [rows] = await db.execute("SELECT * FROM orders WHERE id = ?", [
      orderId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.json({ order: mapOrder(rows[0]) });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      message: "Unable to retrieve order.",
    });
  }
});

// ========================================
// DELETE ORDER
// ========================================

app.delete("/api/orders/:id", async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    const [rows] = await db.execute("SELECT * FROM orders WHERE id = ?", [
      orderId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found." });
    }

    await db.execute("DELETE FROM orders WHERE id = ?", [orderId]);

    return res.json({
      message: "Order deleted successfully.",
      order: mapOrder(rows[0]),
    });
  } catch (error) {
    console.error("Delete order error:", error);

    return res.status(500).json({
      message: "Unable to delete order.",
    });
  }
});

// ========================================
// UNKNOWN API ROUTE
// ========================================

app.use("/api", (req, res) => {
  return res.status(404).json({
    message: "API endpoint not found.",
  });
});

// ========================================
// ERROR HANDLER
// ========================================

app.use((error, req, res, next) => {
  console.error("Unexpected server error:", error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    message: "An unexpected server error occurred.",
  });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`D&G E-Commerce API running on port ${PORT}`);
  console.log(`Products available: ${products.length}`);
});
