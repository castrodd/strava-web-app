#!/bin/bash
# Push to all remotes

echo "Pushing to origin..."
git push origin main

echo "Pushing to Vercel repo..."
git push vercel main

echo "Done!"
