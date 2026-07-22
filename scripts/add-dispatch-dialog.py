import sys

with open("src/app/(dashboard)/dashboard/orders/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Find the Confirm Dialogs section
old_start = '      {/* ─── Confirm Dialogs ───────────────────────────────────── */}'
idx = content.find(old_start)
if idx < 0:
    print("ERROR: Could not find Confirm Dialogs section")
    sys.exit(1)

# Extract the existing Confirm Dialogs block (two ConfirmDialog components)
# We need to find the end of the second ConfirmDialog
search_from = idx
# First ConfirmDialog
cd1_end = content.find("      />", content.find("onConfirm={confirmSingleDelete}", search_from)) + len("      />")
# Between
between = content.find("/>", cd1_end) + 2  # skip to next line
# Second ConfirmDialog
cd2_end = content.find("      />", content.find("onConfirm={confirmBulkDelete}", between)) + len("      />")

existing_dialogs = content[idx:cd2_end]

# New dispatch dialog to insert before the existing ones
dispatch_dialog = """      {/* ─── Dispatch Dialog ────────────────────────────────── */}
      <DispatchDialog
        open={dispatchDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDispatchDialogOpen(false);
            setPendingDispatchOrderId(null);
            setPendingDispatchNewStatus(null);
          }
        }}
        courierName={courierConfig?.providerLabel || null}
        onDispatch={handleDispatch}
      />

"""

new_content = content[:idx] + dispatch_dialog + content[idx:]

with open("src/app/(dashboard)/dashboard/orders/page.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("SUCCESS: DispatchDialog added to orders page")
