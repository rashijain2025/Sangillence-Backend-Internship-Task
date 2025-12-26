const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================
// Admin Login
// ==========================================
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        error: "Username and password are required" 
      });
    }

    // Find admin by username from admins table
    const result = await pool.query(
      "SELECT * FROM admins WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: "Invalid username or password" 
      });
    }

    const admin = result.rows[0];

    // Password compare
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        error: "Invalid username or password" 
      });
    }

    // JWT token generate
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ 
        error: "JWT_SECRET is not configured" 
      });
    }

    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Success response
    res.json({ 
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });

  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    res.status(500).json({ 
      error: "Internal server error",
      details: err.message 
    });
  }
};

// ==========================================
// Register User (Admin creates new users)
// ==========================================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, organizer_id } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        error: "All fields are required (name, email, password, role)" 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: "Invalid email format" 
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: "User with this email already exists" 
      });
    }

    // Password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, organizer_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, role, organizer_id || null]
    );

    res.status(201).json({ 
      success: true,
      message: `${role} registered successfully`,
      user: result.rows[0]
    });

  } catch (err) {
    console.error("USER REGISTER ERROR:", err);
    res.status(500).json({ 
      error: "Internal server error",
      details: err.message 
    });
  }
};

// ==========================================
// Get All Users (Optional - for admin dashboard)
// ==========================================
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, organizer_id, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      count: result.rows.length,
      users: result.rows
    });

  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ 
      error: "Internal server error",
      details: err.message 
    });
  }
};

// ==========================================
// Delete User (Optional - for admin)
// ==========================================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      user: result.rows[0]
    });

  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ 
      error: "Internal server error",
      details: err.message 
    });
  }
};

// ==========================================
// Change Admin Password (Optional - security)
// ==========================================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id; // From JWT middleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: "Current password and new password are required" 
      });
    }

    // Get current admin
    const result = await pool.query(
      "SELECT * FROM admins WHERE id = $1",
      [adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: "Admin not found" 
      });
    }

    const admin = result.rows[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        error: "Current password is incorrect" 
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      "UPDATE admins SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [hashedNewPassword, adminId]
    );

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ 
      error: "Internal server error",
      details: err.message 
    });
  }
};
