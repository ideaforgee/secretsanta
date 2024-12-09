import React from 'react';
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Box,
  IconButton
} from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const ListTable = ({ columns = [], rows = [], actionButtons }) => {

  return (
    <Paper sx={{ width: '95%', overflow: 'hidden', margin: '40px auto', padding: '20px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
        <Box>
          {actionButtons?.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              variant="contained"
              // color={action.color || 'primary'}
              style={{ marginRight: '10px', backgroundColor: 'var(--primary-button-color)'
              }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </Box>

      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.map((row, rowIndex) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                  {columns.map((column) => {
                    const value = row[column.key];
                    if (column.isLink) {
                      return (
                        <TableCell
                          key={`${rowIndex} - ${column.key}`}
                          align={column.align || 'left'}
                          style={{cursor: 'pointer', color: 'blue', textDecoration: 'underline'}}
                        >
                          {/* <a
                            href={value}
                            target='_blank'
                            rel='noopener noreferrer'
                            style={{color: 'inherit', textDecoration: 'inherit'}}
                          >  </a> */}
                          <IconButton
                            href={value}
                            target='_blank'
                            rel='noopener noreferrer'
                            style={{ color: 'inherit' }}
                          > <OpenInNewIcon /> </IconButton>
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell 
                        key={`${rowIndex}-${column.key}`} 
                        align={column.align || 'left'}>
                        {column.format && typeof value === 'number'? column.format(value): value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ListTable;
