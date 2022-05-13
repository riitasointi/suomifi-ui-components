import { font } from '../../../../../core/theme/reset';
import { css } from 'styled-components';
import { SuomifiTheme } from '../../../../theme';

export const selectSuggestionStyles = (theme: SuomifiTheme) => css`
  & .fi-select-suggestion_hint_text {
    padding: 8px 32px 8px 10px;
    ${font(theme)('actionElementInnerText')}
    background: ${theme.colors.depthLight2};
    color: ${theme.colors.depthDark1};
    font-style: italic;
  }

  & .fi-select-suggestion_item {
    padding: 8px 32px 8px 10px;
    cursor: pointer;
    ${font(theme)('actionElementInnerText')}
    font-weight: bold;
    &:hover {
      background-color: ${theme.colors.highlightBase};
      color: ${theme.colors.whiteBase};
    }
    &--hasKeyboardFocus {
      background-color: ${theme.colors.highlightBase};
      color: ${theme.colors.whiteBase};
    }
  }
`;
