import React, { Component } from 'react';
import { default as styled } from 'styled-components';
import classnames from 'classnames';
import { HtmlDiv, HtmlLi } from '../../../../reset';
import { CheckboxProps, Checkbox } from '../../Checkbox/Checkbox';
import { baseStyles } from './ComboboxItem.baseStyles';

const baseClassName = 'fi-combobox-item';

const comboboxItemClassNames = {
  wrapper: `${baseClassName}_wrapper`,
  currentSelection: `${baseClassName}--currentSelection`,
};

export interface ComboboxItemProps
  extends Omit<CheckboxProps, 'ref' | 'forwardedRef'> {
  /** ComboboxItem container div class name for custom styling. */
  className?: string;
  currentSelection: boolean;
}

class BaseComboboxItem extends Component<ComboboxItemProps> {
  render() {
    const {
      className,
      children,
      defaultChecked,
      currentSelection,
      disabled,
      id,
      ...passProps
    } = this.props;
    return (
      <HtmlLi
        className={classnames(baseClassName, className, {
          [comboboxItemClassNames.currentSelection]: currentSelection,
        })}
        tabIndex={-1}
        role="option"
        aria-selected={defaultChecked}
        aria-disabled={disabled || false}
        id={id}
      >
        <HtmlDiv className={comboboxItemClassNames.wrapper}>
          <Checkbox
            disabled={disabled}
            defaultChecked={defaultChecked}
            {...passProps}
          >
            {children}
          </Checkbox>
        </HtmlDiv>
      </HtmlLi>
    );
  }
}

const StyledComboboxItem = styled(BaseComboboxItem)`
  ${baseStyles}
`;

export class ComboboxItem extends Component<ComboboxItemProps> {
  render() {
    return <StyledComboboxItem {...this.props} />;
  }
}
