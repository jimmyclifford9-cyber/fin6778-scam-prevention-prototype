# FIN 6778 AI Scam Prevention Prototype

An interactive academic prototype for the University of Central Florida course FIN 6778: Foundations of FinTech.

## Project concept

The proposed platform helps banks and credit unions reduce authorized-push-payment scams. It combines transaction-pattern analysis with a conversational AI safety check. A suspicious transfer can be paused and escalated to a trained employee before funds become difficult to recover.

## Demonstrated scenario

- A customer attempts to send $4,800 to a new recipient.
- The simulated system assigns a risk score of 87/100.
- The customer answers context-sensitive safety questions.
- The transfer is temporarily paused.
- A synthetic case is escalated for human review.

## Important limitations

This project uses synthetic data and simulated AI outputs. It does not connect to a bank, process payments, provide financial advice, or make real fraud decisions. The prototype demonstrates a user experience and proposed workflow, not a production fraud model.

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
