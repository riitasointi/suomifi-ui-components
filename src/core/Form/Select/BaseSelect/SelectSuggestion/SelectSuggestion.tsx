import React, { Component } from 'react';
import { default as styled } from 'styled-components';
import { SuomifiThemeProp, SuomifiThemeConsumer } from '../../../../theme';
import { HtmlDiv, HtmlLi } from '../../../../../reset';
import { selectSuggestionStyles } from './SelectSuggestion.baseStyles';
import classnames from 'classnames';

const baseClassName = 'fi-select-suggestion';

const classNames = {
  hint_text: `${baseClassName}_hint_text`,
  item: `${baseClassName}_item`,
  hasKeyboardFocus: `${baseClassName}_item--hasKeyboardFocus`,
};

export interface SelectSuggestionProps {
  /** Text displayed above the item. */
  hintText: string;
  /** onClick event handler */
  onClick: (event: React.MouseEvent<HTMLLIElement>) => void;
  /** Indicates if the current item has keyboard focus. */
  hasKeyboardFocus: boolean;
  /** Unique id for the item */
  id: string;
}

class BaseSelectSuggestion extends Component<
  SelectSuggestionProps & SuomifiThemeProp
> {
  render() {
    const { hintText, onClick, hasKeyboardFocus, children, ...passProps } =
      this.props;

    return (
      <HtmlDiv {...passProps}>
        <HtmlDiv className={classNames.hint_text}>{hintText}</HtmlDiv>
        <HtmlLi
          className={classnames(classNames.item, {
            [classNames.hasKeyboardFocus]: hasKeyboardFocus,
          })}
          tabIndex={-1}
          onMouseDown={(event) => {
            // prevent focusing the li element
            event.preventDefault();
          }}
          onClick={(event) => {
            if (!!onClick) {
              onClick(event);
            }
          }}
          role="option"
        >
          {children}
        </HtmlLi>
      </HtmlDiv>
    );
  }
}

const StyledSelectSuggestion = styled(BaseSelectSuggestion)`
  ${({ theme }) => selectSuggestionStyles(theme)}
`;

export class SelectSuggestion extends Component<SelectSuggestionProps> {
  render() {
    return (
      <SuomifiThemeConsumer>
        {({ suomifiTheme }) => (
          <StyledSelectSuggestion theme={suomifiTheme} {...this.props} />
        )}
      </SuomifiThemeConsumer>
    );
  }
}
