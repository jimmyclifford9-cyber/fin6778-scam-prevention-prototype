# FIN 6778 AI Scam Prevention Prototype

An interactive academic prototype for the University of Central Florida course FIN 6778: Foundations of FinTech.

## Project concept

The proposed platform helps banks and credit unions reduce authorized-push-payment scams. It combines transaction-pattern analysis with a conversational AI safety check. A suspicious transfer can be paused and escalated to a trained employee before funds become difficult to recover.

## Working prototype features

- Editable transfer amount, typical transaction amount, recipient, payment method, and timing.
- Three scenario presets for low-, medium-, and high-risk transactions.
- Transparent rules-based scoring with a point-by-point explanation.
- Low-risk approval, medium-risk verification, and high-risk hold outcomes.
- A conversational customer safety check that changes the score based on the answers.
- A fraud-analyst dashboard with a prioritized case queue, transaction signals, customer responses, an audit log, and working analyst decisions.

## Important limitations

This project uses synthetic data and simulated AI outputs. The risk engine is a transparent rules-based demonstration, not a trained production model. It does not connect to a bank, process payments, provide financial advice, or make real fraud decisions. The prototype demonstrates a user experience and proposed workflow.

## Run locally

No installation is required. Open `index.html` in a web browser.

For a local web server, run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a public GitHub repository.
2. Upload `index.html`, `styles.css`, `app.js`, and this README.
3. Open the repository's **Settings**.
4. Select **Pages** under **Code and automation**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select the `main` branch and `/ (root)` folder, then save.

## Team

- James Clifford
- Cody Gilstrap
- Aden Brady

## Course

FIN 6778 - Foundations of FinTech, Fall 2026
