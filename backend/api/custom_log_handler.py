import logging
import logging.handlers
import multiprocessing
import os
import time

# Once a process has acquired a lock, subsequent attempts to acquire it from any process will block until it is released
lock_rollover = multiprocessing.Lock()


class MultiProcessSafeTimedRotatingFileHandler(
    logging.handlers.TimedRotatingFileHandler
):
    """
    Custom handler to override the default logging.handlers.TimedRotatingFileHandler as it is not safe
    to use with multiprocess.
    We are currently using multiple processes and we have to let only one process to deal with logging into one specific file
    instead of trying to do logging from all or more than one process at a time.
    """

    def __init__(
        self,
        filename: str,
        when: str = "h",
        interval: int = 1,
        backupCount: int = 0,
        encoding: str = None,
        delay: bool = False,
        utc: bool = False,
        atTime: str = None,
    ):
        """
        Initialize the handler.

        Parameters
        ----------
        filename : str
            The filename to use for the log file.
        when : str, optional
            The type of interval, by default "h".
        interval : int, optional
            The interval to use, by default 1.
        backupCount : int, optional
            The number of backups to keep, by default 0.
        encoding : str, optional
            The encoding to use, by default None.
        delay : bool, optional
            Whether to delay file opening, by default False.
        utc : bool, optional
            Whether to use UTC, by default False.
        atTime : str, optional
            The time to roll over at, by default None.
        """
        super().__init__(
            filename, when, interval, backupCount, encoding, delay, utc, atTime
        )
        filename = self.baseFilename
        if os.path.exists(filename):
            with open(filename) as file:
                line = file.readline()
                if line == "":
                    t = int(time.time())
                else:
                    n = line.find(",")
                    line = line[:n]
                    t = int(time.mktime(time.strptime(line, "[%Y-%m-%d %H:%M:%S")))

        else:
            t = int(time.time())
        self.rolloverAt = self.computeRollover(t)

    def emit(self, record: logging.LogRecord):
        """
        Emit a record.
        Output the record to the file, catering for rollover as described
        in doRollover().

        Parameters
        ----------
        record : logging.LogRecord
            The record to emit.
        """
        try:
            if self.shouldRollover(record):
                if self.stream:
                    self.stream.close()
                    self.stream = None
                with lock_rollover:
                    f = open(self.baseFilename, "r")

                    line = f.readline()
                    if line == "":
                        f.close()
                        self.doRollover()
                    else:
                        f.close()

                        n = line.find(",")
                        line = line[:n]
                        t = int(time.mktime(time.strptime(line, "[%Y-%m-%d %H:%M:%S")))

                        now = int(time.time())
                        if t >= self.rolloverAt:
                            if self.computeRollover(t) <= now:
                                self.rolloverAt = self.computeRollover(t)
                                self.doRollover()
                            else:
                                self.rolloverAt = t
                                self.stream = self._open()
                        else:
                            if self.computeRollover(t) >= now:
                                self.rolloverAt = t
                                self.stream = self._open()
                            else:
                                self.doRollover()

            logging.FileHandler.emit(self, record)
        except Exception: # noqa BLE001
            self.handleError(record)