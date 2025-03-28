# Setting up the Project

This guide provides instructions for setting up and running the project on your local machine. The project consists of two parts:

1. **Smart Contracts** (in the `/engine` directory)
2. **Frontend** (in the `/client` directory)

Make sure you have the following prerequisites installed on your system:

- **pnpm** 
- **dojo**
- **scarb** 

## Setting Up the Project

1. Clone the repository:
   ```bash
   git clone https://github.com/SoarinSkySagar/stark-tic-tac-toe.git
   cd stark-tic-tac-toe
   ```

2. Install dependencies for the frontend:
   ```bash
   cd client
   pnpm install
   ```

3. Create and switch into you own branch:
    ```bash
   git branch <your-branch>
   git checkout <your-branch>
   ```

## Running the Entire Project

To run the entire project, including both smart contracts and the frontend:

1. Build and test the smart contracts:
   ```bash
   pnpm run build-e
   pnpm run test-e
   ```

2. Run the frontend:
   ```bash
   pnpm run dev-c
   ```

The frontend should now be running at `http://localhost:3000`

## Running Only the Smart Contracts

To work exclusively with the smart contracts:

1. Navigate to the `/engine` directory:
   ```bash
   cd engine
   ```

2. Build the contracts:
   ```bash
   sozo build
   ```

3. Test the contracts:
   ```bash
   sozo test
   ```

4. Format the contracts:
   ```bash
   scarb fmt
   ```

If you want to check the formatting, use:
   ```bash
   scarb fmt --check
   ```

## Running Only the Frontend

To work exclusively with the frontend:

1. Navigate to the `/client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the frontend in development mode:
   ```bash
   pnpm run dev
   ```

4. To build the frontend for production:
   ```bash
   pnpm run build
   ```

5. To test the frontend (linting):
   ```bash
   pnpm run lint
   ```

## Available Scripts

### Root Scripts

- `pnpm run build-e`: Build the smart contracts.
- `pnpm run test-e`: Test the smart contracts.
- `pnpm run lint-e`: Format the smart contracts.
- `pnpm run dev-c`: Run the frontend in development mode.
- `pnpm run build-c`: Lint and build the frontend.
- `pnpm run start-c`: Start the production build of the frontend.
- `pnpm run lint-c`: Lint the frontend.

### Frontend Scripts

Run these commands from the `/client` directory:

- `pnpm run dev`: Start the frontend in development mode.
- `pnpm run build`: Build the frontend for production.
- `pnpm run start`: Start the production build of the frontend.
- `pnpm run lint`: Run linting checks.

## Notes for Contributors

- Follow our contributor's guide given [here](./CONTRIBUTING.md).
- Make sure to follow the respective commands for working on either the smart contracts or the frontend.
- Run `pnpm install` in the `/client` directory before running the frontend for the first time.
- Ensure the code is properly building, passing tests and formatted using `pnpm run check` at the root directory before making a pull request.