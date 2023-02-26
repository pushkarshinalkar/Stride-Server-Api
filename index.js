const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

const pool = new pg.Pool({
    connectionString: 'postgresql://postgres:TGULlCSFWsPNWSWeMMWY@containers-us-west-126.railway.app:7017/railway',
  });




// endpoint for sending mail // can be used anywhere

  app.post('/contact', async (req, res) => {
    try {
      const { firstName, lastName, email, phone, message } = req.body;
  
      // Create a transporter object with SMTP configuration
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'courseappmail@gmail.com',
          pass: 'vbxjoyvvlurzltvc'
        }
      });
  
      // Setup email data
      const mailOptions = {
        from: `${firstName} ${lastName} <${email}>`,
        to: 'pushkarshinalkar001@gmail.com',
        subject: 'New Message from Website Contact Form',
        text: `Name: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`
      };
  
      // Send email using transporter object
      const info = await transporter.sendMail(mailOptions);
  
      console.log('Message sent: %s', info.messageId);
  
      res.status(200).send({ code: 200, message: 'Message sent successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).send({ code: 500, message: 'Something went wrong, please try again later.' });
    }
  });





// API endpoints for app_user table

app.get('/users', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM app_user');
        res.send(rows);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}); 

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM app_user WHERE u_id = $1', [id]);
        res.send(rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/users', async (req, res) => {
    const { u_name, u_email, u_password, u_profile_photo_link } = req.body;
    try {
        const { rows } = await pool.query(
            'INSERT INTO app_user (u_name, u_email, u_password, u_profile_photo_link) VALUES ($1, $2, $3, $4) RETURNING *',
            [u_name, u_email, u_password, u_profile_photo_link]
        );
        res.send(rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { u_name, u_email, u_password, u_profile_photo_link } = req.body;
    try {
        const { rows } = await pool.query(
            'UPDATE app_user SET u_name = $1, u_email = $2, u_password = $3, u_profile_photo_link = $4 WHERE u_id = $5 RETURNING *',
            [u_name, u_email, u_password, u_profile_photo_link, id]
        );
        res.send(rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM app_user WHERE u_id = $1', [id]);
        res.send(`User ${id} deleted successfully`);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/login', async (req, res) => {
    const { u_email, u_password } = req.body;
    try {
        const { rows } = await pool.query(
            'SELECT * FROM app_user WHERE u_email = $1 AND u_password = $2',
            [u_email, u_password]
        );
        if (rows.length > 0) {
            const user = rows[0];
            res.send({ user }); // Valid credentials, return the user object
        } else {
            res.status(401).send('Invalid credentials'); // Invalid credentials
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});



// API endpoints for course table

app.get('/courses', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM course');
        res.send(rows);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/courses/featured', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM course WHERE c_is_featured = true');
        res.send(rows);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/courses/search', async (req, res) => {
    const { keyword } = req.query;
    try {
        const { rows } = await pool.query(`SELECT * FROM course WHERE c_name ILIKE '%${keyword}%'`);
        res.send(rows);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});



app.get('/courses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM course WHERE c_id = $1', [id]);
        res.send(rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/courses', async (req, res) => {
    const { c_name, c_num_videos, c_total_time, c_small_image_link, c_mid_image_link, c_big_image_link } = req.body;
    try {
        const { rows } = await pool.query(
            'INSERT INTO course (c_name, c_num_videos, c_total_time, c_small_image_link, c_mid_image_link, c_big_image_link) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [c_name, c_num_videos, c_total_time, c_small_image_link, c_mid_image_link, c_big_image_link]
        );
        res.send(rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.put('/courses/:id', async (req, res) => {
    const { id } = req.params;
    const { c_name, c_num_videos, c_total_time, c_small_image_link, c_mid_image_link, c_big_image_link } = req.body;
    try {
        const { rows } = await pool.query(
            'UPDATE course SET c_name = $1, c_num_videos = $2, c_total_time = $3, c_small_image_link = $4, c_mid_image_link = $5, c_big_image_link = $6 WHERE c_id = $7 RETURNING *',
            [c_name, c_num_videos, c_total_time, c_small_image_link, c_mid_image_link, c_big_image_link, id]
        );
        res.send(rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/courses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM course WHERE c_id = $1', [id]);
        res.send('Course ${ id } deleted successfully');
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

// API endpoints for favorite_course table

app.get('/favorites', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM favorite_course');
        res.send(rows);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/favorites/user/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM favorite_course WHERE f_user_id = $1', [id]);
        res.send(rows);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/favorites/course/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM favorite_course WHERE f_course_id =$1', [id]);
        res.send(rows);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/favorites', async (req, res) => {
    const { f_user_id, f_course_id } = req.body;
    try {
        const { rows } = await pool.query(
            'INSERT INTO favorite_course (f_user_id, f_course_id) VALUES ($1, $2) RETURNING *',
            [f_user_id, f_course_id]
        );
        res.send(rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/favorites/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM favorite_course WHERE f_user_id = $1', [id]);
        res.send('Favorites for user ${ id } deleted successfully');
} catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
}
});

// API endpoints for video table

app.get('/videos', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM video');
        res.send(rows);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/videos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM video WHERE v_id = $1', [id]);
        res.send(rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/videos/courseid/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM video WHERE v_course_id = $1', [id]);
        res.send(rows);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/videos', async (req, res) => {
    const { v_course_id, v_name, v_time_min, v_small_image_link, v_transcript, v_link } = req.body;
    try {
        const { rows } = await pool.query(
            'INSERT INTO video (v_course_id, v_name, v_time_min, v_small_image_link, v_transcript, v_link) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [v_course_id, v_name, v_time_min, v_small_image_link, v_transcript, v_link]
        );
        res.send(rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.put('/videos/:id', async (req, res) => {
    const { id } = req.params;
    const { v_course_id, v_name, v_time_min, v_small_image_link, v_transcript, v_link } = req.body;
    try {
        const { rows } = await pool.query(
            'UPDATE video SET v_course_id = $1, v_name = $2, v_time_min = $3, v_small_image_link = $4, v_transcript = $5, v_link = $6 WHERE v_id = $7 RETURNING *',
            [v_course_id, v_name, v_time_min, v_small_image_link, v_transcript, v_link, id]
        );
        res.send(rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/videos/:id', async (req, res) => {
    const {id} = req.params;
    try {
        await pool.query('DELETE FROM video WHERE v_id = $1', [id]);
        res.send('Video ${ id } deleted successfully');
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/history/user/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM watch_history WHERE w_user_id = $1', [id]);
        res.send(rows);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
