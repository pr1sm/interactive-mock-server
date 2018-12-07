import React from 'react';
import PropTypes from 'prop-types';
import shortId from 'shortid';

import FeatherIcon from '../common/icon';

class ResponseHeaderInputTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      headers: props.initialHeaders,
      newHeader: ['', '', shortId.generate()],
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { headers } = this.state;
    const { onHeadersChange } = this.props;
    if (prevState.headers.length !== headers.length) {
      onHeadersChange(headers);
    }
  }

  static get propTypes() {
    return {
      isEditing: PropTypes.bool,
      initialHeaders: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
      onHeadersChange: PropTypes.func,
    };
  }

  static get defaultProps() {
    return {
      isEditing: false,
      initialHeaders: [],
      onHeadersChange: () => {},
    };
  }

  generateInputChangeHandler(idx, part) {
    return evt => {
      const { headers, newHeader } = this.state;
      const [curName, curValue, key] = idx === -1 ? newHeader : headers[idx];
      const newData =
        part === 0 ? [evt.target.value, curValue, key] : [curName, evt.target.value, key];

      let update = {
        newHeader: newData,
      };
      if (idx !== -1) {
        headers[idx] = newData;
        update = {
          headers,
        };
      }
      this.setState(update);
    };
  }

  generateDeleteClickHandler(idx) {
    return () => {
      const { headers } = this.state;
      headers.splice(idx, 1);
      this.setState({
        headers,
      });
    };
  }

  render() {
    const { isEditing } = this.props;
    const { headers, newHeader } = this.state;

    // Check if we are in readonly mode and don't have any saved headers
    if (!isEditing && headers.length === 0) {
      return <div className="pt-2 pb-3 pl-1">No Headers Present!</div>;
    }

    const inputProps = {
      className: `form-control${isEditing ? '' : '-plaintext'}`,
      readOnly: !isEditing,
      required: isEditing,
      onBlur: () => {
        const filtered = headers.filter(([name, value]) => name || value);
        if (filtered.length !== headers.length) {
          this.setState({
            headers: filtered,
          });
        }
      },
    };

    const headerCols = [['reshead', 'Response Header'], ['val', 'Value']].map(([key, text]) => (
      <th key={key} className="border-bottom-0 border-top-0">
        {text}
      </th>
    ));
    headerCols.push(
      <th
        key="delete"
        className="border-bottom-0 border-top-0 endpoints__table__col endpoints__table__col--slim"
      />,
    );
    const headerRows = [<tr key="header-row">{headerCols}</tr>];

    const bodyRows = headers.map(([name, value, key], idx) => (
      <tr key={key}>
        <td>
          <input
            type="text"
            placeholder="HEADER"
            value={name}
            onChange={this.generateInputChangeHandler(idx, 0)}
            {...inputProps}
          />
        </td>
        <td>
          <input
            type="text"
            placeholder="VALUE"
            value={value}
            onChange={this.generateInputChangeHandler(idx, 1)}
            {...inputProps}
          />
        </td>
        <td className="endpoints__table__col endpoints__table__col--slim">
          <button
            type="button"
            className="btn btn-danger w-10"
            onClick={this.generateDeleteClickHandler(idx)}
            disabled={!isEditing}
          >
            <FeatherIcon icon="trash" />
          </button>
        </td>
      </tr>
    ));

    if (isEditing) {
      const newHeaderInputProps = {
        className: inputProps.className,
        onBlur: () => {
          if (newHeader[0] || newHeader[1]) {
            headers.push(newHeader);
            this.setState({
              headers,
              newHeader: ['', '', shortId.generate()],
            });
          }
        },
      };
      bodyRows.push(
        <tr key={newHeader[2]}>
          <td>
            <input
              type="text"
              placeholder="HEADER"
              className="form-control"
              value={newHeader[0]}
              onChange={this.generateInputChangeHandler(-1, 0)}
              {...newHeaderInputProps}
            />
          </td>
          <td>
            <input
              type="text"
              placeholder="VALUE"
              className="form-control"
              value={newHeader[1]}
              onChange={this.generateInputChangeHandler(-1, 1)}
              {...newHeaderInputProps}
            />
          </td>
          <td className="endpoints__table__col endpoints__table__col--slim">&nbsp;</td>
        </tr>,
      );
    }

    return (
      <table className="table endpoints__table">
        <thead>{headerRows}</thead>
        <tbody>{bodyRows}</tbody>
      </table>
    );
  }
}

export default ResponseHeaderInputTable;
