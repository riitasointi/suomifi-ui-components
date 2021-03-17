import React, { Component } from 'react';
import { default as styled } from 'styled-components';
import classnames from 'classnames';
import { HtmlDiv, HtmlLi } from '../../../../reset';
import { baseStyles } from './ComboboxEmptyItem.baseStyles';

const baseClassName = 'fi-combobox-empty-item';

const comboboxItemClassNames = {
  wrapper: `${baseClassName}_wrapper`,
};

export interface ComboboxEmptyItemProps {
  /** ComboboxItem container div class name for custom styling. */
  className?: string;
}

class BaseComboboxEmptyItem extends Component<ComboboxEmptyItemProps> {
  render() {
    const { className, children, ...passProps } = this.props;
    return (
      <HtmlLi
        className={classnames(baseClassName, className, {})}
        tabIndex={-1}
        role="option"
      >
        <HtmlDiv className={comboboxItemClassNames.wrapper} {...passProps}>
          {children}
        </HtmlDiv>
      </HtmlLi>
    );
  }
}

const StyledComboboxEmptyItem = styled(BaseComboboxEmptyItem)`
  ${baseStyles}
`;

export class ComboboxEmptyItem extends Component<ComboboxEmptyItemProps> {
  render() {
    return <StyledComboboxEmptyItem {...this.props} />;
  }
}