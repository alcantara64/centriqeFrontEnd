/** 08042021 - Gaurav - JIRA-CA-351: Update NPS/ Resp default email template body */
export const defaultSurveyEmailTemplate = {
  counters: {
    u_column: 5,
    u_row: 5,
    u_content_text: 3,
    u_content_button: 3,
  },
  body: {
    rows: [
      {
        cells: [1],
        columns: [
          {
            contents: [
              {
                type: 'text',
                values: {
                  containerPadding: '10px',
                  _meta: {
                    htmlID: 'u_content_text_1',
                    htmlClassNames: 'u_content_text',
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  color: '#000000',
                  textAlign: 'left',
                  lineHeight: '140%',
                  linkStyle: {
                    inherit: true,
                    linkColor: '#0000ee',
                    linkHoverColor: '#0000ee',
                    linkUnderline: true,
                    linkHoverUnderline: true,
                  },
                  hideDesktop: false,
                  hideMobile: false,
                  text:
                    '<p style="font-size: 14px; line-height: 140%;">&nbsp;</p>\n<p style="font-size: 14px; line-height: 140%;">{#surveyIntroText}</p>\n<p style="font-size: 14px; line-height: 140%;">&nbsp;</p>',
                },
              },
            ],
            values: {
              backgroundColor: '',
              padding: '0px',
              border: {},
              _meta: {
                htmlID: 'u_column_1',
                htmlClassNames: 'u_column',
              },
            },
          },
        ],
        values: {
          displayCondition: null,
          columns: false,
          backgroundColor: '',
          columnsBackgroundColor: '',
          backgroundImage: {
            url: '',
            fullWidth: true,
            repeat: false,
            center: true,
            cover: false,
          },
          padding: '0px',
          hideDesktop: false,
          hideMobile: false,
          noStackMobile: false,
          _meta: {
            htmlID: 'u_row_1',
            htmlClassNames: 'u_row',
          },
          selectable: true,
          draggable: true,
          duplicatable: true,
          deletable: true,
        },
      },
      {
        cells: [1],
        columns: [
          {
            contents: [
              {
                type: 'button',
                values: {
                  containerPadding: '10px',
                  _meta: {
                    htmlID: 'u_content_button_3',
                    htmlClassNames: 'u_content_button',
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  href: {
                    name: 'web',
                    values: {
                      href: '{#surveyPlainUrl}',
                      target: '_blank',
                    },
                    attrs: {
                      href: '{{href}}',
                      target: '{{target}}',
                    },
                  },
                  buttonColors: {
                    color: '#FFFFFF',
                    backgroundColor: '#3AAEE0',
                    hoverColor: '#FFFFFF',
                    hoverBackgroundColor: '#3AAEE0',
                  },
                  size: {
                    autoWidth: true,
                    width: '100%',
                  },
                  textAlign: 'center',
                  lineHeight: '120%',
                  padding: '10px 20px',
                  border: {},
                  borderRadius: '4px',
                  hideDesktop: false,
                  hideMobile: false,
                  text:
                    '<span style="font-size: 14px; line-height: 16.8px;">Open Survey</span>',
                  calculatedWidth: 122,
                  calculatedHeight: 36,
                },
              },
            ],
            values: {
              backgroundColor: '',
              padding: '0px',
              border: {},
              _meta: {
                htmlID: 'u_column_5',
                htmlClassNames: 'u_column',
              },
            },
          },
        ],
        values: {
          displayCondition: null,
          columns: false,
          backgroundColor: '',
          columnsBackgroundColor: '',
          backgroundImage: {
            url: '',
            fullWidth: true,
            repeat: false,
            center: true,
            cover: false,
          },
          padding: '0px',
          hideDesktop: false,
          hideMobile: false,
          noStackMobile: false,
          _meta: {
            htmlID: 'u_row_5',
            htmlClassNames: 'u_row',
          },
          selectable: true,
          draggable: true,
          duplicatable: true,
          deletable: true,
        },
      },
      {
        cells: [1],
        columns: [
          {
            contents: [
              {
                type: 'text',
                values: {
                  containerPadding: '10px',
                  _meta: {
                    htmlID: 'u_content_text_2',
                    htmlClassNames: 'u_content_text',
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  color: '#000000',
                  textAlign: 'left',
                  lineHeight: '140%',
                  linkStyle: {
                    inherit: true,
                    linkColor: '#0000ee',
                    linkHoverColor: '#0000ee',
                    linkUnderline: true,
                    linkHoverUnderline: true,
                  },
                  hideDesktop: false,
                  hideMobile: false,
                  text:
                    '<p style="font-size: 14px; line-height: 140%; text-align: center;">&nbsp;</p>\n<p style="font-size: 14px; line-height: 140%; text-align: center;">&nbsp;</p>\n<p style="font-size: 14px; line-height: 140%; text-align: center;">&nbsp;</p>\n<p style="font-size: 14px; line-height: 140%; text-align: center;"><span style="font-size: 10px; line-height: 14px; color: #7e8c8d;">You&rsquo;re receiving this email because your contact is on our subscriber list.</span><br /><span style="font-size: 10px; line-height: 14px; color: #7e8c8d;">You can <strong>{#unsubscribeUrl}</strong> if you prefer not to receive information from us.</span></p>\n<p style="font-size: 14px; line-height: 140%; text-align: center;">&nbsp;</p>\n<p style="font-size: 14px; line-height: 140%; text-align: center;"><span style="font-size: 10px; line-height: 14px; color: #7e8c8d;">{#orgDetails}</span></p>',
                },
              },
            ],
            values: {
              backgroundColor: '',
              padding: '0px',
              border: {},
              _meta: {
                htmlID: 'u_column_2',
                htmlClassNames: 'u_column',
              },
            },
          },
        ],
        values: {
          displayCondition: null,
          columns: false,
          backgroundColor: '',
          columnsBackgroundColor: '',
          backgroundImage: {
            url: '',
            fullWidth: true,
            repeat: false,
            center: true,
            cover: false,
          },
          padding: '0px',
          hideDesktop: false,
          hideMobile: false,
          noStackMobile: false,
          _meta: {
            htmlID: 'u_row_2',
            htmlClassNames: 'u_row',
          },
          selectable: true,
          draggable: true,
          duplicatable: true,
          deletable: true,
        },
      },
    ],
    values: {
      backgroundColor: '#ffffff',
      backgroundImage: {
        url: '',
        fullWidth: true,
        repeat: false,
        center: true,
        cover: false,
      },
      contentWidth: '500px',
      contentAlign: 'center',
      fontFamily: {
        label: 'Arial',
        value: 'arial,helvetica,sans-serif',
      },
      preheaderText: '',
      linkStyle: {
        body: true,
        linkColor: '#0000ee',
        linkHoverColor: '#0000ee',
        linkUnderline: true,
        linkHoverUnderline: true,
      },
      _meta: {
        htmlID: 'u_body',
        htmlClassNames: 'u_body',
      },
    },
  },
  schemaVersion: 5,
};
