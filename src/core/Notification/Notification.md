```js
import {
  Notification,
  Button,
  Paragraph
} from 'suomifi-ui-components';

<>
  <Notification closeText="Close">
    Et turpis eget tempor. Nam sed lacus ut lorem feugiat tincidunt.
    Mauris quis nisi placerat
  </Notification>
  <Notification
    status="error"
    headingText="Lorem ipsum dolor sit"
    smallScreen
  >
    Et turpis eget tempor. Nam sed lacus ut lorem feugiat tincidunt.
    Mauris quis nisi placerat
  </Notification>
  <Notification
    closeText="Close"
    headingText="Lorem ipsum dolor sit"
    headingVariant="h3"
    actionElements={
      <>
        <Button>Button</Button>
        <Button variant="secondary">Button</Button>
      </>
    }
  >
    <Paragraph style={{ fontSize: '16px' }}>
      This is a long notification text. Lorem ipsum dolor sit amet,
      consectetur adipiscing elit.
    </Paragraph>
    <Paragraph style={{ fontSize: '16px' }}>
      Et turpis eget tempor. Nam sed lacus ut lorem feugiat tincidunt.
      Mauris quis nisi placerat, convallis turpis nec, auctor massa.
      Nam ornare tortor id tortor tristique.
    </Paragraph>
  </Notification>
</>;
```