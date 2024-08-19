import React from 'react';
import { Autocomplete } from './components/AutoComplete';

import './App.css';

const App = () => {
  return (
    <div className="app-container">
      <header>
        <h1>Currency autocomplete 🪙</h1>
      </header>
      <main>
        <section className="autocomplete-section">
          <Autocomplete placeholder="Start typing... eg.: British Pound" />
        </section>
      </main>
    </div>
  );
};

export default App;