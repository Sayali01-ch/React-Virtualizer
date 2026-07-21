# React Virtualization

This workspace contains a React + TypeScript demo for a virtualized infinite-scroll table.

## Run the demo

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the local demo server:

   ```bash
   npm run dev
   ```

3. Open the browser at the URL shown by Vite (usually `http://localhost:5173`).

## Preview for your manager

- Use `npm run dev` to show the working demo interactively.
- Use `npm run preview` after `npm run build` for a production-like preview.

start index=scrollTop/height 
End index=(scrollTop + window height) / height

New start index =Math.max(0, start index -overscan);
End Index=Math.min(totalNumberOfItems, End index + overscan);
