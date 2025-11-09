#!/bin/bash
cd /home/kavia/workspace/code-generation/connectmatch-184374-184383/dating_app_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

