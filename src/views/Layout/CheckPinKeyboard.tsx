import React, { useState, useEffect } from 'react';
import { Button, Grid, Container, Box, styled } from '@mui/material';
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

import { checkPasswordForWallet } from 'src/functions/ChivesWallets'


// 圆形按钮样式
const RoundButton = styled(Button)(() => ({
  borderRadius: '50%',
  minWidth: '75px',
  minHeight: '75px',
  fontSize: '1.5rem',
}));

// 数字键盘组件
const NumberPad = ({ onInput }: { onInput: (num: number | 'backspace') => void }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, 0];

  const handleClick = (num: number) => {
    onInput(num);
  };

  const handleBackspace = () => {
    onInput('backspace');
  };

  return (
    <Grid container spacing={2} justifyContent="center" mt={10}>
        <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={3} mt={3}>
            {numbers.map((num) => (
                <Grid item key={num} m={1.5}>
                  {num >= 0 && (
                    <RoundButton variant="outlined" onClick={() => handleClick(num)}>
                        {num}
                    </RoundButton>
                  )}
                </Grid>
            ))}
            <Grid item mt={3} m={1.5}>
                <Button size="small" sx={{mt: 4, p: 1}} variant="outlined" onClick={handleBackspace}>
                ←
                </Button>
            </Grid>
        </Box>
    </Grid>
  );
};

// 输入指示器组件
const InputIndicator = ({ length }: { length: number }) => {
  return (
    <Box display="flex" justifyContent="center" mt={10}>
      {[...Array(6)].map((_, index) => (
        <Box
          key={index}
          width={10}
          height={10}
          borderRadius="50%"
          bgcolor={index < length ? 'primary.main' : 'grey.300'}
          mx={1}
        />
      ))}
    </Box>
  );
};

// 钱包解锁组件
const CheckPinKeyboard = ({ handleWalletGoHome, setEncryptWalletDataKey } : any) => {
  const { t } = useTranslation()

  const [inputLength, setInputLength] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [headerTitle, setHeaderTitle] = useState<string>(t('Input Pin Code') as string);

  const handleInput = (num: number | 'backspace') => {
    if (num === 'backspace') {
      setInputValue(inputValue.slice(0, -1));
      setInputLength(Math.max(0, inputLength - 1));
      setHeaderTitle(t('Input Pin Code') as string)
    }
    else {
      if (inputLength < 6) {
        setInputValue(inputValue + num);
        setInputLength(inputLength + 1);
        setHeaderTitle(t('Input Pin Code') as string)
      }
    }
  };

  useEffect(() =>   {
    if(inputLength == 6)  {
        const checkPasswordForWalletData = checkPasswordForWallet(inputValue)

        //console.log("checkPasswordForWalletData", checkPasswordForWalletData, inputValue)

        if(checkPasswordForWalletData)   {
          setEncryptWalletDataKey(inputValue)
          handleWalletGoHome()
        }
        else {
          setInputValue('')
          setInputLength(0)
          setHeaderTitle(t('Pin Code Error') as string)
          toast.error(t('Pin Code Error') as string, { duration: 2500, position: 'top-center' })
        }
    }
  }, [inputValue, inputLength]);

  return (
    <Container>
      <Box display="flex" justifyContent="center" mt={2}>
          <Typography variant="h5" mt={2}>
              {t(headerTitle) as string}
          </Typography>
      </Box>
      <InputIndicator length={inputLength} />
      <NumberPad onInput={handleInput} />
    </Container>
  );
};

export default CheckPinKeyboard;
