import dotenv from 'dotenv'
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import OpenAI from 'openai';
let chatHistory = [];
dotenv.config();

const openai = new OpenAI({
  // organization:'org-11zyn53amxUp4gXMtMhRfHYw',
  apiKey: process.env.API_KEY,
});

const app = express()
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ['GET', 'POST']
  },
});
const port = process.env.PORT
app.use(cors());

app.get('/', function (req, res) {
  res.send('Hello World')
})

io.on('connection', (socket) => {
  console.log('Socket connection');

  socket.on('sendMessage', async (data) => {
    if (data.message) {
      chatHistory.push({ role: 'user', content: data.message })

      const chatCompletion = await openai.chat.completions.create({
        messages: data.message,
        model: 'gpt-3.5-turbo',
      });

      io.emit('receiveMessage', {
        message: `${chatCompletion.choices[0].message.content}`,
      });

      chatHistory.push(chatCompletion.choices[0].message.content);
      console.log(chatHistory, "chatHistory");
    }

  });

  socket.on('disconnect', () => {
    chatHistory = [];
    console.error('user disconnected');
  })
})


server.listen(port, () => {
  console.log(`Server started at ${port}`);
})