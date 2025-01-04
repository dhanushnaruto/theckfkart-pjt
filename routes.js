const express = require('express')
const connection = require('./db.js')
const router = express.Router()


router.get('/', (req, res)=>{
    res.send('helllo world')
})

router.get('/users/:userId/posts', (req, res)=>{
    const {userId} = req.params

    connection.query('SELECT * FROM POSTS WHERE USERID = ?', [userId], (err, result)=>{
        if(err) res.status(500).json({error:err.message})
            res.json(result)
    })
})


router.post('/users/:userId/posts', (req, res)=>{
    const {userId} = req.params
    const {title, description, images} = req.body

    connection.query('SELECT * FROM users WHERE id = ?', [userId], (err, users)=>{
        if(err) return res.status(500).json({ error: err.message });
        if(users.length === 0) return res.status(404).json({error: 'User is not found'})
    })

    connection.query('INSERT INTO posts (title, description, userId, images) VALUES (?, ?, ?, ?)', [title, description, userId,JSON.stringify(images)], (err, result)=>{
        if(err) return res.status(500).json({error: err.message})

        connection.query('UPDATE users SET post_count = post_count + 1 WHERE id = ?', [userId], (err, result)=>{
            if(err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, title, description, images });
        })
    })


})


router.put('/posts/:postId', (req, res) => {
    const { postId } = req.params;
    const { title, description, images } = req.body;

    connection.query(
        'UPDATE posts SET title = ?, description = ?, images = ? WHERE id = ?',
        [title, description, JSON.stringify(images), postId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Post not found' });
            res.json({ id: postId, title, description, images });
        }
    );
});


router.delete('/posts/:postId', (req, res) => {
    const { postId } = req.params;

    
    connection.query('SELECT * FROM posts WHERE id = ?', [postId], (err, posts) => {
        if (err) return res.status(500).json({ error: err.message });
        if (posts.length === 0) return res.status(404).json({ error: 'Post not found' });

        const userId = posts[0].userId;

        
        connection.query('DELETE FROM posts WHERE id = ?', [postId], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            
            connection.query(
                'UPDATE users SET post_count = post_count - 1 WHERE id = ?',
                [userId],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                }
            );

            res.send('deleted successfully')
        });
    });
});


router.get('/users', (req, res) => {
    connection.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


router.get('/posts', (req, res) => {
    connection.query('SELECT * FROM posts', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


module.exports = router