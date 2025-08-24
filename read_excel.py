import pandas as pd

try:
    # Read the Excel file
    df = pd.read_excel('testcases/transactionlist.xlsx')
    
    print('Columns:', df.columns.tolist())
    print('\nDataFrame shape:', df.shape)
    print('\nFirst 5 rows:')
    print(df.head())
    
    print('\nLooking for Auto column or YES values...')
    for col in df.columns:
        unique_vals = df[col].unique()
        print(f'Column "{col}": unique values = {unique_vals[:10]}')
    
    # Look for rows with YES values
    auto_rows = df[df.apply(lambda row: any('YES' in str(val).upper() for val in row if pd.notna(val)), axis=1)]
    
    print(f'\nRows containing YES: {len(auto_rows)}')
    if len(auto_rows) > 0:
        print('\nRows with YES values:')
        print(auto_rows)
        
        # Save to CSV for easier viewing
        auto_rows.to_csv('auto_test_cases.csv', index=False)
        print('\nAuto test cases saved to auto_test_cases.csv')
    
except Exception as e:
    print(f'Error reading Excel file: {e}')
    print('\nTrying to read all sheets...')
    try:
        xl_file = pd.ExcelFile('testcases/transactionlist.xlsx')
        print('Sheet names:', xl_file.sheet_names)
        
        for sheet_name in xl_file.sheet_names:
            print(f'\n--- Sheet: {sheet_name} ---')
            df_sheet = pd.read_excel('testcases/transactionlist.xlsx', sheet_name=sheet_name)
            print(f'Shape: {df_sheet.shape}')
            print('Columns:', df_sheet.columns.tolist())
            if len(df_sheet) > 0:
                print('First few rows:')
                print(df_sheet.head(3))
    except Exception as e2:
        print(f'Error reading sheets: {e2}')