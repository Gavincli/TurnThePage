# updated post method
Extend POST /api/sessions to support:

userId (required)

minutesRead (required)

pagesRead (optional? per team decision, but consistent with UI)

sessionDate (required)

bookId (optional)

bookFinished (optional boolean)

If bookFinished = true, mark that book as finished immediately

Done when:

A single request logs a full reading session from the Log Reading page

Finished books are removed from current-reading results right after submit

Validation errors are clear and consistent

