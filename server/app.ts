import cors from 'cors';
import express, { type Express } from 'express';

const app: Express = express();

// Set the application to trust the reverse proxy
app.set('trust proxy', true);

// Middlewares
// app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use('/health-check', healthCheckRouter);
app.get('/ping', (req, res) => {
  res.send('Hello World ' + new Date().toISOString());
});
app.use(express.static('build'));

// app.use(errorHandler());

export { app };

app.set('port', process.env.PORT || 9000);

app.listen(app.get('port'), () => {
  console.log(
    '\n  🚀 api server is running at http://localhost:%d in %s mode',
    app.get('port'),
    app.get('env'),
  );
  console.log('\n  Press CTRL-C to stop\n');
});
