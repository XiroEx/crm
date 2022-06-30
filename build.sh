#!/bin/sh
cd functions && npx eslint --fix . && firebase deploy --only functions && cd .. && npm run build && firebase deploy --only hosting