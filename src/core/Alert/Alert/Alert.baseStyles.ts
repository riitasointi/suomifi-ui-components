import { css } from 'styled-components';
import { SuomifiTheme } from '../../theme';
import { font } from '../../theme/reset';
import { baseAlertBaseStyles } from '../BaseAlert/BaseAlert.baseStyles';

export const baseStyles = (theme: SuomifiTheme) => css`
  ${baseAlertBaseStyles(theme)}

  & .fi-alert_icon-wrapper {
    display: flex;
  }

  & .fi-alert_style-wrapper {
    max-width: 1110px;
    margin: auto;
  }

  & .fi-alert_close-button {
    ${font(theme)('bodyTextSmall')}
    height: 40px;
    display: inline-block;
    padding: 7px;
    margin-top: 7px;
    margin-right: ${theme.spacing.xs};
    margin-bottom: ${theme.spacing.insetM};
    border: 1px solid transparent;
    border-radius: ${theme.radius.basic};
    white-space: nowrap;

    &:focus-visible {
      outline: 0;
      position: relative;

      &:after {
        ${theme.focus.absoluteFocus}
      }
    }
    &:active {
      background: ${theme.gradients.whiteBaseToDepthLight1};
    }
    &:hover {
      border-color: ${theme.colors.blackBase};
    }

    & .fi-icon {
      width: 14px;
      height: 14px;
      margin-left: ${theme.spacing.xxs};
      transform: translateY(0.1em);

      .fi-icon-base-fill {
        fill: currentColor;
      }
    }
  }

  /** Small screen variant styles */
  &.fi-alert--small-screen {
    & .fi-alert_style-wrapper {
      max-width: 100%;
    }

    & .fi-alert_text-content-wrapper {
      padding: 0 0 0 10px;
    }

    & .fi-alert_close-button {
      margin: 0;
      & .fi-icon {
        margin-right: ${theme.spacing.xxs};
      }
    }
  }
`;
