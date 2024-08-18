# Autocomplete Exercise (Deel)
This project demonstrates a high-performance, production-ready autocomplete component built with React and TypeScript, following specific requirements for an exercise.
___
## Features
- Asynchronous data fetching with debounce
- Keyboard navigation support
- Highlighting of matched text
- Responsive design
- TypeScript support
- No external libraries used (pure React and DOM functions)
- Edge case handling for optimal user experience
___
## Prerequisites
- Node.js
- pnpm
___
## 🚀 Installation and Usage
1. **Clone the repository** <br />
   `git clone https://github.com/your-username/autocomplete-exercise.git`
2. **Navigate to the project directory** <br />
   `cd autocomplete-exercise`
3. **Install dependencies** <br />
   `pnpm i` or `pnpm install`
4. **Runs** (choose how you need to run it) <br />
   a. **Development mode** <br />
   `pnpm dev` <br />
   b. **Build the app for production** <br />
   `pnpm build` <br />
   _Previews the built app_: `pnpm preview` <br />

___
## 🧪 Tests
1. To run the test suite <br />
`pnpm test`
2. To run the test suite with coverage <br />
`pnpm test:coverage`

## 🏛 Project Structure
```
.
├── coverage
├── eslint.config.js
├── index.html
├── jest.config.ts
├── jest.setup.ts
├── package.json
├── pnpm-lock.yaml
├── public
├── README.md
├── src
│   ├── App.css
│   ├── App.test.tsx
│   ├── App.tsx
│   ├── components
│   │   └── AutoComplete
│   │       ├── index.css
│   │       ├── index.test.tsx
│   │       └── index.tsx
│   ├── hooks
│   │   ├── index.ts
│   │   └── useDebounce
│   │       ├── index.test.ts
│   │       └── index.ts
│   ├── index.css
│   ├── main.tsx
│   ├── services
│   │   ├── index.ts
│   │   └── mockedApi
│   │       ├── index.test.ts
│   │       └── index.ts
│   ├── types
│   │   └── index.ts
│   └── vite-env.d.ts
├── tsconfig.app.json
├── tsconfig.jest.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```
___
## Key Components
- `src/components/AutoComplete/index.tsx`: The main Autocomplete component
- `src/hooks/useDebounce/index.ts`: Custom hook for debouncing input
- `src/services/mockedApi/index.ts`: Asynchronous function for fetching suggestions
___
## Design Decisions and Notes
1. **Performance optimization:** Debounce is used to limit API calls and improve performance.
2. **No external libraries:** As per requirements, only pure React and internal DOM functions are used.
3. **TypeScript:** Proper interfaces and types are used throughout the project.
4. **Asynchronous filtering:** The `fetchSuggestions` function in `mockedApi` simulates an asynchronous API call.
5. **CSS:** Basic styling is applied to ensure functionality and readability.
6. **Edge cases:** The component handles various scenarios like no results, loading states, and keyboard navigation.
7. **Text highlighting:** Matching parts of the text are highlighted in the suggestions.
8. **State management:** Only native React state management is used (no external libraries).
9. **Functional components:** All components are functional and use React hooks.
10. **Real API usage:** Using the free api (https://restcountries.com/v3.1) to receive real data when typing.

## 📬 Contact
📧 lucas@padilha.io <br>
📞 +351912015235 <br>
🔗 [LinkedIn](https://www.linkedin.com/in/lucas-padilhax/)