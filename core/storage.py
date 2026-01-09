from django.core.files.storage import FileSystemStorage
from django.utils.text import get_valid_filename


class UnicodeSafeFileSystemStorage(FileSystemStorage):
    """Storage that normalises uploaded filenames to a safe ASCII-compatible form.

    It uses Django's `get_valid_filename` to strip problematic characters
    and avoid Unicode-related filesystem encoding errors in environments
    without a UTF-8 locale.
    """

    def get_valid_name(self, name):
        return get_valid_filename(name)
