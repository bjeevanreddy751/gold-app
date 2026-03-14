import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = 'http://127.0.0.1:5000/api';

function App() {
  const [historicalData, setHistoricalData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Prediction Form State using lagged values
  const [formData, setFormData] = useState({
    T_minus_3: 71000,
    T_minus_2: 71250,
    T_minus_1: 71400
  });
  
  const [predictionResult, setPredictionResult] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState('');

  // Fetch Historical Data on Component Mount
  useEffect(() => {
    fetchHistoricalData();
  }, []);

  const fetchHistoricalData = async () => {
    try {
      setLoadingHistory(true);
      const response = await axios.get(`${API_BASE_URL}/historical`);
      setHistoricalData(response.data);
      
      // Auto-fill the form with the most recent 3 days if available
      if (response.data && response.data.length >= 3) {
        const lastIdx = response.data.length - 1;
        setFormData({
          T_minus_3: response.data[lastIdx - 2].Gold_Price.toFixed(2),
          T_minus_2: response.data[lastIdx - 1].Gold_Price.toFixed(2),
          T_minus_1: response.data[lastIdx].Gold_Price.toFixed(2)
        });
      }
    } catch (err) {
      console.error("Error fetching historical data:", err);
      setError("Failed to load historical data. Ensure backend is running.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredicting(true);
    setError('');
    setPredictionResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, formData);
      setPredictionResult(response.data.prediction);
    } catch (err) {
      setError("Prediction failed. Please try again.");
      console.error(err);
    } finally {
      setPredicting(false);
    }
  };

  // Prepare chart data for univariate time series
  const chartData = {
    labels: historicalData.map(d => new Date(d.Date).toLocaleDateString()),
    datasets: [
      {
        label: 'Gold Price (INR / 10g)',
        data: historicalData.map(d => d.Gold_Price),
        borderColor: 'rgb(255, 215, 0)',
        backgroundColor: 'rgba(255, 215, 0, 0.5)',
        tension: 0.1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Recent Gold Prices (INR / 10 grams)',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Price (₹)'
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      },
    },
  };

  return (
    <div className="App bg-light min-vh-100 py-5">
      <Container>
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold" style={{ color: '#DAA520' }}>Gold Predictor AI</h1>
          <p className="lead text-muted">Forecasting tomorrow's Gold price based on historical trends (INR per 10g).</p>
        </div>

        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

        <Row className="mb-4">
          <Col lg={8}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <Card.Title className="mb-4 text-secondary">Historical Market Trends (INR)</Card.Title>
                {loadingHistory ? (
                  <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                    <Spinner animation="border" variant="warning" />
                  </div>
                ) : historicalData.length > 0 ? (
                  <Line options={chartOptions} data={chartData} height={100} />
                ) : (
                  <div className="text-center text-muted p-5">No historical data available.</div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <Card.Title className="mb-4 text-primary">Predict Tomorrow's Price</Card.Title>
                <Form onSubmit={handlePredict}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price 3 Days Ago (₹)</Form.Label>
                    <Form.Control 
                      type="number" 
                      step="0.01" 
                      name="T_minus_3" 
                      value={formData.T_minus_3} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Price 2 Days Ago (₹)</Form.Label>
                    <Form.Control 
                      type="number" 
                      step="0.01" 
                      name="T_minus_2" 
                      value={formData.T_minus_2} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>Yesterday's Price (₹)</Form.Label>
                    <Form.Control 
                      type="number" 
                      step="0.01" 
                      name="T_minus_1" 
                      value={formData.T_minus_1} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </Form.Group>
                  
                  <div className="d-grid gap-2">
                    <Button 
                      variant="warning" 
                      size="lg" 
                      type="submit" 
                      disabled={predicting}
                      className="text-white fw-bold"
                      style={{ backgroundColor: '#DAA520', borderColor: '#DAA520' }}
                    >
                      {predicting ? <Spinner size="sm" animation="border" /> : 'Predict Next Price'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {predictionResult !== null && (
          <Row className="mt-4 fade-in">
            <Col>
              <Card className="shadow border-0 bg-success text-white text-center">
                <Card.Body className="py-5">
                  <h3 className="mb-3">Predicted Gold Price (Next Day)</h3>
                  <h1 className="display-3 fw-bold">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(predictionResult)}
                  </h1>
                  <p className="mt-3 opacity-75">Per 10 grams. Based on historical trends using Random Forest Time Series Forecasting.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

export default App;
