#!/bin/bash
curl -X POST localhost:3000/telegrambot -H "Content-Type: application/json"  -d "{\"message\":{\"text\": \"$*\", \"chat\":{\"id\":1}}}"