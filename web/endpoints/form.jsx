import React from 'react';
import PropTypes from 'prop-types';
import shortId from 'shortid';

import ResponseHeaderInputTable from './responseHeaderInputTable';

export const FormState = {
  readOnly: 0,
  isEditing: 1,
  isCreating: 2,
};

class EndpointForm extends React.Component {
  static get propTypes() {
    return {
      formState: PropTypes.number,
      onInputChange: PropTypes.func,
      onFormSubmit: PropTypes.func,
      onCancelEdit: PropTypes.func,
      onEdit: PropTypes.func,
      onDelete: PropTypes.func,
      endpoint: PropTypes.objectOf(PropTypes.any).isRequired,
    };
  }

  static get defaultProps() {
    return {
      formState: FormState.readOnly,
      onInputChange: () => {},
      onFormSubmit: () => {},
      onCancelEdit: () => {},
      onEdit: () => {},
      onDelete: () => {},
    };
  }

  generateInputHandler(type) {
    const evtHandler = evt => {
      const { onInputChange } = this.props;
      onInputChange(type, evt);
    };

    return evtHandler.bind(this);
  }

  renderRedirectRouteInput() {
    const {
      endpoint: {
        response: { statusCode, redirect },
      },
      formState,
    } = this.props;
    const redirectValue = !formState ? redirect || 'N/A' : redirect;
    // Only render for 3xx responses when editing
    if (formState && (statusCode < 300 || statusCode >= 400)) {
      return undefined;
    }

    return (
      <div className="form-group col-md-6 no-gutters">
        <label htmlFor="formRedirectRouteInput" className="col">
          Redirect Route
          <input
            type="text"
            className={formState ? 'form-control' : 'form-control-plaintext'}
            id="formRedirectRouteInput"
            onChange={this.generateInputHandler('redirect')}
            value={redirectValue}
            required={!!formState}
            readOnly={!formState}
          />
        </label>
      </div>
    );
  }

  renderFormBottomRow() {
    const { formState, onEdit, onCancelEdit, onDelete } = this.props;
    const buttonProps = [];

    if (formState === FormState.isCreating) {
      buttonProps.push({
        type: 'submit',
        className: 'btn btn-primary',
        key: 'create',
        text: 'Create',
      });
    } else if (formState === FormState.isEditing) {
      buttonProps.push({
        type: 'submit',
        className: 'btn btn-primary',
        key: 'update',
        text: 'Update',
      });
      buttonProps.push({
        type: 'button',
        className: 'btn btn-secondary',
        onClick: onCancelEdit,
        key: 'cancel',
        text: 'Cancel',
      });
    } else {
      buttonProps.push({
        type: 'button',
        className: 'btn btn-danger',
        onClick: onDelete,
        key: 'delete',
        text: 'Delete',
      });
      buttonProps.push({
        type: 'button',
        className: 'btn btn-primary-outline',
        onClick: onEdit,
        key: 'edit',
        text: 'Edit',
      });
    }

    return (
      <div className="form-row">
        {buttonProps.map(({ key, text, ...props }) => (
          <div className="form-group col" key={key}>
            <button type="button" {...props}>{`${text}`}</button>
          </div>
        ))}
      </div>
    );
  }

  renderHeaderInputTable() {
    const { formState, endpoint, onInputChange } = this.props;
    const handleHeadersChange = headers => {
      onInputChange('headers', headers);
    };
    // Check if we need to rerender the table
    const key = !endpoint.forceUpdate ? 'create' : shortId.generate();
    return (
      <ResponseHeaderInputTable
        key={key}
        isEditing={formState !== FormState.readOnly}
        initialHeaders={endpoint.headers}
        onHeadersChange={handleHeadersChange}
      />
    );
  }

  render() {
    const {
      formState,
      onFormSubmit,
      endpoint: {
        route,
        method,
        response: { body, statusCode },
      },
    } = this.props;
    const formInputProps = {
      className: `form-control${formState ? '' : '-plaintext'}`,
      readOnly: !formState,
      required: formState,
    };
    const formSubmit = formState ? onFormSubmit : EndpointForm.defaultProps.onFormSubmit;

    return (
      <form className="endpoints__form col" onSubmit={formSubmit}>
        <div className="form-row">
          <div className="form-group col-md-6 no-gutters">
            <label htmlFor="formRouteInput" className="col">
              Route
              <input
                type="text"
                id="formRouteInput"
                onChange={this.generateInputHandler('route')}
                value={route}
                {...formInputProps}
              />
            </label>
          </div>
          <div className="form-group col-md-6 no-gutters">
            <label htmlFor="formStatusInput" className="col">
              Response Status
              <input
                type="number"
                id="formStatusInput"
                onChange={this.generateInputHandler('statusCode')}
                value={`${statusCode}`}
                {...formInputProps}
              />
            </label>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6 no-gutters">
            <label htmlFor="formMethodSelect" className="col">
              Method
              <select
                id="formMethodSelect"
                onChange={this.generateInputHandler('method')}
                value={`${method}`}
                {...formInputProps}
              >
                <option value="GET">GET</option>
                <option value="HEAD">HEAD</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="CONNECT">CONNECT</option>
                <option value="OPTIONS">OPTIONS</option>
                <option value="TRACE">TRACE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </label>
          </div>
          {this.renderRedirectRouteInput()}
        </div>
        <div className="form-row">
          <div className="form-group col no-gutters">
            <label htmlFor="formBodyTextArea" className="col">
              Response Body
              <textarea
                id="formBodyTextArea"
                rows="5"
                onChange={this.generateInputHandler('body')}
                value={body}
                readOnly={!formState}
                className="form-control"
                required={false}
              />
            </label>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col no-gutters">{this.renderHeaderInputTable()}</div>
        </div>
        {this.renderFormBottomRow()}
      </form>
    );
  }
}

export default EndpointForm;
