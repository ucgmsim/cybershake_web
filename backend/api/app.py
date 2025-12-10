import argparse
from pathlib import Path

import yaml

from backend.api.server import app

if __name__ == "__main__":
    with open(Path(__file__).parent / "api_config.yaml") as f:
        config = yaml.safe_load(f)

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--port",
        type=int,
        help="Port number, default: port number from the config file.",
        default=config["port"],
    )
    args = parser.parse_args()

    app.run(threaded=False, host="0.0.0.0", port=args.port, use_reloader=False, debug=False)
