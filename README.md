# Barcode generator for payments

**DEPLOYED TO:** https://react-barcode-generator.vercel.app/

**-- ALL PLANNED FEATURES ADDED --**  

[Sample usage with imported query params](https://react-barcode-generator.vercel.app/?sender.name=Pero%20Peri%C4%87&sender.street=Ulica%201&sender.postcode=51000&sender.city=Rijeka&receiver.name=Ana%20Ani%C4%87&receiver.street=Cesta%201&receiver.postcode=10000&receiver.city=Zagreb&receiver.iban=HR8323600009999999991&amount=9.999,99&receiver.model=00&receiver.reference=123-456-789&purpose=OTHR&description=Uplata)

The app is now standalone, meaning it works without any API calls (so no more CORS issues!) and therefore it works without any extensions, as well as on mobile!

Changelog (since first working version; unfortunately since the repo was deleted I have simply included an additional unused file called OldApp.js for reference):

Added:

- Vastly improved UX; now the validation happens onBlur instead of onInput, doesn't render a paragraph with error messages but simply changes the border color of the field in question.
   - Added a check to see if a field was ever focused (visited) before validating it at all. Unvisited fields are now gray, valid fields are green and invalid fields are red.
   - Also added special styling to accentuate the currently focused and/or hovered element.

- IBAN validation now checks if it is constructed properly (doesn't guarantee the IBAN actually exists, but guarantees that it might).
   - This will help in case you miss a digit, since the new number will not match the specification and the calculation will fail.
   - If the calculation fails the submit will not go through, so you will not receive an incorrect barcode due to a typo.
      - Also, special care has been given to this field in a more recent update; only certain inputs are allowed, pasting is validated to only go through if the clipboard contains something that MIGHT be a valid IBAN (regex test).
      - For this reason, the context menu has also been disabled for this field in that update (25th August 2023).
   - NEW: Improved the input/pasting validations, added the option to construct the IBAN from the BIC and BBAN so I have a reason to show off using modals for more than cookie consent (and persisting state).
  - Also added BBAN / accountNumber validation through the control digit on constructed IBANs which select a bank and input the account number.
  - This makes sure that the account number might exist, as the ISO 7064 MOD-11-10 algorithm is implemented and calculates the control digit from the first 9 digits, then checks if the 10th digit corresponds to it.

- Added AutoNumeric.js which formats the input of the amount field live as you type. The final entered value must be at least 1,00.

- Added a list of all post codes and places into a select element, replacing the original input element which only checked for 5 digits followed by a space and a string with a max length.
   - This includes a check for the final submitted value if it matches one of the listed options to prevent request tampering.
   - NEW: Added a filter above the select so the user can search for the place.
   - NEW: Replaced this with 2 inputs; typing in the postcode fills in the corresponding city, and it can be manually edited after that for edge cases.

- Added a download option and a Web share option upon successful generation. The data: URL is now saved in the user's localStorage as well.

- Cookies remember sender data so future visits from the same person/browser will automatically fill it in for convenience.
  - The cookie will persist for a year.
  - NEW: Added cookie options so the user can decide if this happens or not.
  
  - NEW: Fixed the responsiveness of the modal on smaller devices, though the app itself isn't supported on mobile due to CORS issues.
      - In the final version of this app which will be hosted on a server, the server will be whitelisted by the API so CORS will no longer break the app without workarounds (which are not even possible on mobile).
        - NEW: The app is now fully supported on mobile devices because there are no more API requests (everything is generated locally) so there is no more crossorigin.

- Moved most of the data constants into a separate file for easier code maintainability.
   - Added a separate CurrencyInput component which utilizes AutoNumeric and gets passed the App's props, because I promised myself I would make at least one child component with variable props in this app.
   - NEW: Also added SearchableSelect as another child component. This one is used by 2 fields instead of 1. Fixed it being properly populated by the cookie if consent is given.
   - NEW: Replaced SearchableSelect with PlaceLookup which looks up the corresponding value (and allows it to be edited) instead of offering a filterable search.

- Added a 1 minute timeout for submission as a little bit of basic spam/bot protection and a fun little exercise :).

- Added error paragraphs back, in a better way which doesn't disrupt the flow of the form.

- Added a trigger that forces all fields to be visited and validated upon submission.
  - Otherwise during input, leaving (blurring) a field will trigger validation styling of that specific field, and trigger the rendering of an array of errors whose elements are updated based on their validation.

- Added URL parameters so the form can be filled dynamically by clicking a bookmark.
  
- Added the option to save receiver data in localStorage and pull it into the form.

- Added some basic interactions and validations for model and reference fields;
  - Clearing the reference sets the model to HR99 (this is the only model that accepts an empty reference).
  - Setting the model to HR99 clears the reference (this model requires an empty reference).
  - If the model was HR99, typing inside the reference field switches the model to HR00. For other models, nothing changes.
  - Typing inside the reference field follows the rules of the specification: 22 characters max, 12 digits max between hyphens ("parts"), 2 hyphens max, no leading, trailing or consecutive hyphens.
  - Unfortunately the same problem is encountered as with the IBAN input: using the onKeyDown function disregards any virtual keyboard inputs from mobile devices so only PC users with real keyboards get to experience some of the magic.

\
Possibilities for the distant future:

- Might add a check if the reference format matches the model/purpose selection, but since I am not very smart and the specification is written in Klingon, petaQ it.
  - NEW: Actually implemented some basic rules and functionalities described above. Going further into detail per specific model might not be wise for my sanity, but if this ever outgrows its purpose as a pet project for practice, I might consider it.
