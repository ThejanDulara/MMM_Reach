import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Footer from './components/Footer';
import MediaInputSection from './components/MediaInputSection';
import MediaResultSection from './components/MediaResultSection';

function App() {
  const [results, setResults] = React.useState(null);
  const resultsRef = React.useRef(null);

  const handleCalculate = (data) => {
    setResults(data);
    toast.success('Calculation completed!');
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="app-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <Header />

      <div className="content-container">
        <div className="section-wrapper">
          <MediaInputSection onCalculate={handleCalculate} />
          <div ref={resultsRef}>
            {results && <MediaResultSection data={results} />}
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .app-container {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          display: flex;            /* sticky footer layout */
          flex-direction: column;   /* sticky footer layout */
          background: #f3e8ff;
          padding: 0;
          margin: 0;
        }

        .content-container {
          width: 100%;
          max-width: 1400px;
          padding: 0 2rem;
          margin: 0 auto;
          margin-top: 2rem;
          /* important: no bottom margin */
          flex: 1;                  /* take remaining space so footer sits at bottom */
        }

        .section-wrapper {
          background: #e9d5ff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 2rem;
          /* no extra margins here; container handles spacing */
        }

        @media (min-width: 1400px) {
          .content-container {
            padding: 0 4rem;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
